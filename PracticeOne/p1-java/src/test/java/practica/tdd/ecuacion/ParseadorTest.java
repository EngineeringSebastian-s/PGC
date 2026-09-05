package practica.tdd.ecuacion;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class ParseadorTest {

    private final Parseador parseador = new Parseador();

    @Test
    void obtenerParte1Unidades() {
        assertEquals(2, parseador.obtenerParte1("2x - 1 = 0"));
    }

    @Test
    void obtenerParte2Suma() {
        assertEquals(1, parseador.obtenerParte2("2x + 1 = 0"));
    }

    @Test
    void obtenerParte2Resta() {
        assertEquals(-1, parseador.obtenerParte2("2x - 1 = 0"));
    }

    @Test
    void obtenerParte3Positivo() {
        assertEquals(3, parseador.obtenerParte3("2x + 1 = 3"));
    }

    @Test
    void obtenerOperadorSuma() {
        assertEquals("+", parseador.obtenerOperador("2x + 1 = 0"));
    }

    @Test
    void obtenerOperadorResta() {
        assertEquals("-", parseador.obtenerOperador("2x - 1 = 0"));
    }

    @Test
    void rechazaEcuacionMalFormada() {
        assertThrows(IllegalArgumentException.class, () -> parseador.obtenerParte1("2x + 1"));
    }
}
