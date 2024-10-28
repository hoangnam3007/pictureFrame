package com.demo.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class FrameTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static Frame getFrameSample1() {
        return new Frame().id(1L).title("title1").guidelineUrl("guidelineUrl1").imagePath("imagePath1").usageCount(1);
    }

    public static Frame getFrameSample2() {
        return new Frame().id(2L).title("title2").guidelineUrl("guidelineUrl2").imagePath("imagePath2").usageCount(2);
    }

    public static Frame getFrameRandomSampleGenerator() {
        return new Frame()
            .id(longCount.incrementAndGet())
            .title(UUID.randomUUID().toString())
            .guidelineUrl(UUID.randomUUID().toString())
            .imagePath(UUID.randomUUID().toString())
            .usageCount(intCount.incrementAndGet());
    }
}
