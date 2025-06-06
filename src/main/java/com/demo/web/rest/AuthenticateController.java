package com.demo.web.rest;

import static com.demo.security.SecurityUtils.AUTHORITIES_KEY;
import static com.demo.security.SecurityUtils.JWT_ALGORITHM;

import com.demo.service.UserService;
import com.demo.service.dto.LoginTokenDTO;
import com.demo.web.rest.vm.LoginVM;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.firebase.auth.FirebaseAuth;
import jakarta.validation.Valid;
import java.security.Principal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

/**
 * Controller to authenticate users.
 */
@RestController
@RequestMapping("/api")
public class AuthenticateController {

    private static final Logger LOG = LoggerFactory.getLogger(AuthenticateController.class);

    private final JwtEncoder jwtEncoder;

    @Value("${jhipster.security.authentication.jwt.token-validity-in-seconds:0}")
    private long tokenValidityInSeconds;

    @Value("${jhipster.security.authentication.jwt.token-validity-in-seconds-for-remember-me:0}")
    private long tokenValidityInSecondsForRememberMe;

    private final FirebaseAuth firebaseAuth;
    private final UserService userService;
    private final ReactiveAuthenticationManager authenticationManager;

    public AuthenticateController(
        JwtEncoder jwtEncoder,
        ReactiveAuthenticationManager authenticationManager,
        FirebaseAuth firebaseAuth,
        UserService userService
    ) {
        this.jwtEncoder = jwtEncoder;
        this.authenticationManager = authenticationManager;
        this.firebaseAuth = firebaseAuth;
        this.userService = userService;
    }

    @PostMapping("/authenticate")
    public Mono<ResponseEntity<JWTToken>> authorize(@Valid @RequestBody Mono<LoginVM> loginVM) {
        return loginVM
            .flatMap(login ->
                authenticationManager
                    .authenticate(new UsernamePasswordAuthenticationToken(login.getUsername(), login.getPassword()))
                    .flatMap(auth -> Mono.fromCallable(() -> this.createToken(auth, login.isRememberMe())))
            )
            .map(jwt -> {
                HttpHeaders httpHeaders = new HttpHeaders();
                httpHeaders.setBearerAuth(jwt);
                return new ResponseEntity<>(new JWTToken(jwt), httpHeaders, HttpStatus.OK);
            });
    }

    // New Google Authentication Method
    @PostMapping("/authenticate/google")
    public Mono<ResponseEntity<JWTToken>> authorizeGoogle(@Valid @RequestBody Mono<LoginTokenDTO> googleLoginVM) {
        return googleLoginVM
            .flatMap(login -> {
                // Verify Firebase ID Token
                return Mono.fromCallable(() -> firebaseAuth.verifyIdToken(login.getIdToken())).flatMap(decodedToken -> {
                    // Extract user information
                    String email = decodedToken.getEmail();

                    // Find or create user with email and name
                    return userService
                        .findOrCreateUserByEmail(email)
                        .flatMap(user -> {
                            // Create authentication object
                            Authentication authentication = new UsernamePasswordAuthenticationToken(user.getLogin(), "Google");

                            // Create JWT token
                            String jwt = this.createToken(authentication, login.isRememberMe());

                            // Prepare response with JWT token
                            HttpHeaders httpHeaders = new HttpHeaders();
                            httpHeaders.setBearerAuth(jwt);
                            return Mono.just(new ResponseEntity<>(new JWTToken(jwt), httpHeaders, HttpStatus.OK));
                        });
                });
            })
            .onErrorResume(ex -> {
                LOG.error("Google authentication error", ex);
                return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
            });
    }

    /**
     * {@code GET /authenticate} : check if the user is authenticated, and return its login.
     *
     * @param principal the authentication principal.
     * @return the login if the user is authenticated.
     */
    @GetMapping(value = "/authenticate", produces = MediaType.TEXT_PLAIN_VALUE)
    public String isAuthenticated(Principal principal) {
        LOG.debug("REST request to check if the current user is authenticated");
        return principal == null ? null : principal.getName();
    }

    public String createToken(Authentication authentication, boolean rememberMe) {
        String authorities = authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.joining(" "));

        Instant now = Instant.now();
        Instant validity;
        if (rememberMe) {
            validity = now.plus(this.tokenValidityInSecondsForRememberMe, ChronoUnit.SECONDS);
        } else {
            validity = now.plus(this.tokenValidityInSeconds, ChronoUnit.SECONDS);
        }

        // @formatter:off
        JwtClaimsSet claims = JwtClaimsSet.builder()
            .issuedAt(now)
            .expiresAt(validity)
            .subject(authentication.getName())
            .claim(AUTHORITIES_KEY, authorities)
            .build();

        JwsHeader jwsHeader = JwsHeader.with(JWT_ALGORITHM).build();
        return this.jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();
    }

    /**
     * Object to return as body in JWT Authentication.
     */
    static class JWTToken {

        private String idToken;

        JWTToken(String idToken) {
            this.idToken = idToken;
        }

        @JsonProperty("id_token")
        String getIdToken() {
            return idToken;
        }

        void setIdToken(String idToken) {
            this.idToken = idToken;
        }
    }
}
