package com.demo.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class AdvertisementTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Advertisement getAdvertisementSample1() {
        return new Advertisement().id(1L).brand("brand1").imagePath("imagePath1").redirectUrl("redirectUrl1");
    }

    public static Advertisement getAdvertisementSample2() {
        return new Advertisement().id(2L).brand("brand2").imagePath("imagePath2").redirectUrl("redirectUrl2");
    }

    public static Advertisement getAdvertisementRandomSampleGenerator() {
        return new Advertisement()
            .id(longCount.incrementAndGet())
            .brand(UUID.randomUUID().toString())
            .imagePath(UUID.randomUUID().toString())
            .redirectUrl(UUID.randomUUID().toString());
    }
}
