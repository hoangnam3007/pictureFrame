package com.demo.domain;

import static com.demo.domain.FrameTestSamples.*;
import static com.demo.domain.TransactionTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.demo.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class TransactionTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Transaction.class);
        Transaction transaction1 = getTransactionSample1();
        Transaction transaction2 = new Transaction();
        assertThat(transaction1).isNotEqualTo(transaction2);

        transaction2.setId(transaction1.getId());
        assertThat(transaction1).isEqualTo(transaction2);

        transaction2 = getTransactionSample2();
        assertThat(transaction1).isNotEqualTo(transaction2);
    }

    @Test
    void frameTest() {
        Transaction transaction = getTransactionRandomSampleGenerator();
        Frame frameBack = getFrameRandomSampleGenerator();

        transaction.setFrame(frameBack);
        assertThat(transaction.getFrame()).isEqualTo(frameBack);

        transaction.frame(null);
        assertThat(transaction.getFrame()).isNull();
    }
}
