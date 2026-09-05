package practica.tdd;

public class Calculator {

    public int add(int a, int b) {
        return a + b;
    }

    public int divide(int dividend, int divisor) {
        if (divisor == 0) {
            throw new ArithmeticException("/ by zero");
        }
        return dividend / divisor;
    }
}
