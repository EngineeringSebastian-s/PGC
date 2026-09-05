package practica.tdd

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CalculatorTest {

    private lateinit var calculator: Calculator
    private var suiteInicializada = false

    @BeforeAll
    fun crearSuite() {
        suiteInicializada = true
    }

    @BeforeEach
    fun setUp() {
        calculator = Calculator()
    }

    @Test
    fun `la clase de test se crea una sola vez`() {
        assertEquals(true, suiteInicializada)
    }

    @Test
    fun `suma 1 + 1`() {
        assertEquals(2, calculator.add(1, 1))
    }

    @Test
    fun `divide lanza cuando el divisor es cero`() {
        val exception = assertThrows(ArithmeticException::class.java) {
            calculator.divide(1, 0)
        }
        assertEquals("/ by zero", exception.message)
    }

    @ParameterizedTest(name = "{0} + {1} = {2}")
    @CsvSource(
        "1, 1, 2",
        "2, 3, 5",
        "0, 8, 8",
        "-2, 5, 3",
    )
    fun `suma varios pares`(a: Int, b: Int, expected: Int) {
        assertEquals(expected, calculator.add(a, b))
    }
}
