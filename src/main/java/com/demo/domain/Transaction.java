package com.demo.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

/**
 * A Transaction.
 */
@Table("transaction")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Transaction implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @Column("id")
    private Long id;

    @Column("used_at")
    private Instant usedAt;

    @Transient
    @JsonIgnoreProperties(value = { "creator" }, allowSetters = true)
    private Frame frame;

    @Transient
    private User user;

    @Column("frame_id")
    private Long frameId;

    @Column("user_id")
    private Long userId;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Transaction id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Instant getUsedAt() {
        return this.usedAt;
    }

    public Transaction usedAt(Instant usedAt) {
        this.setUsedAt(usedAt);
        return this;
    }

    public void setUsedAt(Instant usedAt) {
        this.usedAt = usedAt;
    }

    public Frame getFrame() {
        return this.frame;
    }

    public void setFrame(Frame frame) {
        this.frame = frame;
        this.frameId = frame != null ? frame.getId() : null;
    }

    public Transaction frame(Frame frame) {
        this.setFrame(frame);
        return this;
    }

    public User getUser() {
        return this.user;
    }

    public void setUser(User user) {
        this.user = user;
        this.userId = user != null ? user.getId() : null;
    }

    public Transaction user(User user) {
        this.setUser(user);
        return this;
    }

    public Long getFrameId() {
        return this.frameId;
    }

    public void setFrameId(Long frame) {
        this.frameId = frame;
    }

    public Long getUserId() {
        return this.userId;
    }

    public void setUserId(Long user) {
        this.userId = user;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Transaction)) {
            return false;
        }
        return getId() != null && getId().equals(((Transaction) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Transaction{" +
            "id=" + getId() +
            ", usedAt='" + getUsedAt() + "'" +
            "}";
    }
}
