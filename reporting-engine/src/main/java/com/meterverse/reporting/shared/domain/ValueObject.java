package com.meterverse.reporting.shared.domain;

import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.Objects;

public interface ValueObject {

    default boolean equalsByFields(Object other) {
        if (this == other) return true;
        if (other == null || getClass() != other.getClass()) return false;
        Field[] fields = getClass().getDeclaredFields();
        return Arrays.stream(fields).allMatch(f -> {
            f.setAccessible(true);
            try {
                return Objects.equals(f.get(this), f.get(other));
            } catch (IllegalAccessException e) {
                throw new RuntimeException("Reflection equals failed", e);
            }
        });
    }

    default int hashCodeByFields() {
        Field[] fields = getClass().getDeclaredFields();
        return Arrays.stream(fields).mapToInt(f -> {
            f.setAccessible(true);
            try {
                return Objects.hashCode(f.get(this));
            } catch (IllegalAccessException e) {
                throw new RuntimeException("Reflection hashCode failed", e);
            }
        }).reduce(1, (a, b) -> 31 * a + b);
    }
}
