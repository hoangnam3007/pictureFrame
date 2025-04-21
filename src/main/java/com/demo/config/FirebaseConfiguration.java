package com.demo.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import java.io.File;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

@Configuration
public class FirebaseConfiguration {

    @Value("file:D:/Assignment/jhipster/PictureFrame/src/main/resources/firebase-service-account.json")
    private Resource firebaseCredentials;

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        File file = new File("D:/Assignment/jhipster/PictureFrame/src/main/resources/firebase-service-account.json");
        System.out.println(file.exists() ? "File found" : "File not found");

        if (FirebaseApp.getApps().isEmpty()) {
            GoogleCredentials credentials = GoogleCredentials.fromStream(firebaseCredentials.getInputStream());
            FirebaseOptions options = FirebaseOptions.builder().setCredentials(credentials).build();
            return FirebaseApp.initializeApp(options);
        }
        return FirebaseApp.getInstance();
    }

    @Bean
    public FirebaseAuth firebaseAuth(FirebaseApp firebaseApp) {
        return FirebaseAuth.getInstance(firebaseApp);
    }
}
