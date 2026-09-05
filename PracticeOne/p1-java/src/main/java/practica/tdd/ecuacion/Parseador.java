package practica.tdd.ecuacion;

/**
 * Separa una ecuación de primer grado del tipo "ax + b = c" o "ax - b = c".
 * parte1 = a, parte2 = b (con signo), parte3 = c.
 */
public class Parseador {

    public int obtenerParte1(final String ecuacion) {
        validar(ecuacion);
        String[] partes12 = obtenerPartes12(ecuacion);
        String parte1 = partes12[0].trim();
        return Integer.parseInt(parte1.substring(0, parte1.length() - 1));
    }

    public int obtenerParte2(final String ecuacion) {
        validar(ecuacion);
        String[] partes12 = obtenerPartes12(ecuacion);
        String parte2 = partes12[1].trim();
        String operador = obtenerOperador(ecuacion);
        if ("-".equals(operador)) {
            return Integer.parseInt(parte2) * -1;
        }
        return Integer.parseInt(parte2);
    }

    public String obtenerOperador(final String ecuacion) {
        validar(ecuacion);
        if (ecuacion.indexOf('+') > 0) {
            return "+";
        }
        if (ecuacion.indexOf('-') > 0) {
            return "-";
        }
        throw new IllegalArgumentException("La ecuación no tiene operador + o -: " + ecuacion);
    }

    public int obtenerParte3(final String ecuacion) {
        validar(ecuacion);
        String[] partesEcuacion = ecuacion.split("=");
        return Integer.parseInt(partesEcuacion[1].trim());
    }

    private String[] obtenerPartes12(final String ecuacion) {
        String[] partesEcuacion = ecuacion.split("=");
        String operador = obtenerOperador(ecuacion);
        return partesEcuacion[0].split("\\" + operador);
    }

    private void validar(final String ecuacion) {
        if (ecuacion == null || !ecuacion.contains("=")) {
            throw new IllegalArgumentException("Ecuación mal formada: " + ecuacion);
        }
    }
}
