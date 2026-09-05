package practica.tdd.ecuacion;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class EcuacionPrimerGradoMockitoTest {

    @InjectMocks
    private EcuacionPrimerGrado ecuacionPrimerGrado;

    @Mock
    private Parseador parseador;

    @Test
    void solucionaEcuacionConMenos() {
        String ecuacion = "2x - 1 = 0";
        when(parseador.obtenerParte1(ecuacion)).thenReturn(2);
        when(parseador.obtenerParte2(ecuacion)).thenReturn(-1);
        when(parseador.obtenerParte3(ecuacion)).thenReturn(0);

        assertEquals(0.5, ecuacionPrimerGrado.obtenerResultado(ecuacion));
    }

    @Test
    void solucionaEcuacionConMas() {
        String ecuacion = "2x + 1 = 0";
        when(parseador.obtenerParte1(ecuacion)).thenReturn(2);
        when(parseador.obtenerParte2(ecuacion)).thenReturn(1);
        when(parseador.obtenerParte3(ecuacion)).thenReturn(0);

        assertEquals(-0.5, ecuacionPrimerGrado.obtenerResultado(ecuacion));
    }
}
