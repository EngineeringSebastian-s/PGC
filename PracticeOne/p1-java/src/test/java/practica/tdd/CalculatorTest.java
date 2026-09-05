package practica.tdd;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class CalculatorTest {

    private Calculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new Calculator();
    }

    @Test
    void addition() {
        assertEquals(2, calculator.add(1, 1));
    }

    @Test
    void divideThrowsWhenDivisorIsZero() {
        ArithmeticException exception = assertThrows(ArithmeticException.class, () -> calculator.divide(1, 0));
        assertEquals("/ by zero", exception.getMessage());
    }

    @ParameterizedTest(name = "{0} + {1} = {2}")
    @CsvSource({
        "1, 1, 2",
        "2, 3, 5",
        "0, 8, 8",
        "-2, 5, 3"
    })
    void addSeveralPairs(int a, int b, int expected) {
        assertEquals(expected, calculator.add(a, b));
    }
}
