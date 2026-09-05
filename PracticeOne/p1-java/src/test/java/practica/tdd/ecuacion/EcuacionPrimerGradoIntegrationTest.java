package practica.tdd.ecuacion;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class EcuacionPrimerGradoIntegrationTest {

    private final EcuacionPrimerGrado ecuacion = new EcuacionPrimerGrado();

    @Test
    void solucionaEcuacionConMenos() {
        assertEquals(0.5, ecuacion.obtenerResultado("2x - 1 = 0"));
    }

    @Test
    void solucionaEcuacionConMas() {
        assertEquals(-0.5, ecuacion.obtenerResultado("2x + 1 = 0"));
    }

    @Test
    void solucionaEcuacionConParte3Mayor0() {
        assertEquals(4.5, ecuacion.obtenerResultado("2x + 1 = 10"));
    }

    @Test
    void rechazaCoeficienteCero() {
        assertThrows(IllegalArgumentException.class, () -> ecuacion.obtenerResultado("0x + 1 = 3"));
    }
}
