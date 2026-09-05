package practica.tdd.ecuacion;

/**
 * Resuelve ax + b = c, es decir x = (c - b) / a.
 */
public class EcuacionPrimerGrado {

    private Parseador parseador = new Parseador();

    public double obtenerResultado(final String ecuacion) {
        int parte1 = parseador.obtenerParte1(ecuacion);
        if (parte1 == 0) {
            throw new IllegalArgumentException("El coeficiente de x no puede ser 0");
        }
        int parte2 = parseador.obtenerParte2(ecuacion);
        int parte3 = parseador.obtenerParte3(ecuacion);
        return (double) (parte3 - parte2) / (double) parte1;
    }
}
