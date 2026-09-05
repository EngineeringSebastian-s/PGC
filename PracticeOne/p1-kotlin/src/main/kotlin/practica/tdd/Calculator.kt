package practica.tdd

class Calculator {
    fun add(a: Int, b: Int): Int = a + b

    fun divide(dividend: Int, divisor: Int): Int {
        if (divisor == 0) {
            throw ArithmeticException("/ by zero")
        }
        return dividend / divisor
    }
}
