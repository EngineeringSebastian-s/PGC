package practica.tdd;

import java.lang.reflect.Field;
import java.nio.charset.StandardCharsets;
import org.junit.platform.engine.TestExecutionResult;
import org.junit.platform.engine.discovery.DiscoverySelectors;
import org.junit.platform.engine.support.descriptor.MethodSource;
import org.junit.platform.launcher.Launcher;
import org.junit.platform.launcher.LauncherDiscoveryRequest;
import org.junit.platform.launcher.TestIdentifier;
import org.junit.platform.launcher.core.LauncherDiscoveryRequestBuilder;
import org.junit.platform.launcher.core.LauncherFactory;
import org.junit.platform.launcher.listeners.SummaryGeneratingListener;
import practica.tdd.ecuacion.EcuacionPrimerGrado;
import practica.tdd.ecuacion.Parseador;

public final class LiveBridge {

    public static void main(String[] args) throws Exception {
        System.setOut(new java.io.PrintStream(System.out, true, StandardCharsets.UTF_8));
        String step = args.length == 0 ? "" : args[0].trim();
        emit("meta", "{\"jvm\":" + quote(System.getProperty("java.home"))
                + ",\"version\":" + quote(System.getProperty("java.version"))
                + ",\"step\":" + quote(step) + "}");
        if (step.isEmpty()) {
            emit("error", "{\"message\":" + quote("Falta el id del paso") + "}");
            System.exit(2);
            return;
        }
        try {
            dispatch(step);
        } catch (Exception e) {
            emit("error", "{\"message\":" + quote(e.toString()) + "}");
            e.printStackTrace(System.err);
            System.exit(1);
        }
    }

    private static void dispatch(String step) throws Exception {
        Calculator calculator = new Calculator();
        Parseador parseador = new Parseador();
        EcuacionPrimerGrado ecuacion = new EcuacionPrimerGrado();

        switch (step) {
            case "at-test", "assert-equals" -> {
                int got = calculator.add(1, 1);
                line("info", "calculator.add(1, 1) = " + got);
                line("info", "assertEquals(2, " + got + ")");
                emit("visual", "{\"type\":\"sum\",\"left\":1,\"right\":1,\"result\":" + got + "}");
                runTests("practica.tdd.CalculatorTest", "addition");
            }
            case "before-each" -> {
                Calculator a = new Calculator();
                Calculator b = new Calculator();
                line("info", "setUp → new Calculator()  (test addition) add(1,1)=" + a.add(1, 1));
                line("info", "setUp → new Calculator()  (test divide) instancia distinta=" + (a != b));
                emit("visual", """
                        {"type":"timeline","events":[
                          {"label":"setUp","detail":"Calculator #1"},
                          {"label":"addition","detail":"usa #1"},
                          {"label":"setUp","detail":"Calculator #2"},
                          {"label":"divideThrows","detail":"usa #2, no #1"}
                        ]}""");
                runTests("practica.tdd.CalculatorTest");
            }
            case "parameterized" -> {
                int[][] rows = {{1, 1, 2}, {2, 3, 5}, {0, 8, 8}, {-2, 5, 3}};
                StringBuilder table = new StringBuilder("{\"type\":\"table\",\"rows\":[");
                for (int i = 0; i < rows.length; i++) {
                    int got = calculator.add(rows[i][0], rows[i][1]);
                    line("info", rows[i][0] + " + " + rows[i][1] + " = " + got + "  esperado " + rows[i][2]);
                    if (i > 0) {
                        table.append(',');
                    }
                    table.append("{\"expr\":").append(quote(rows[i][0] + " + " + rows[i][1]))
                            .append(",\"got\":").append(got)
                            .append(",\"expected\":").append(rows[i][2]).append('}');
                }
                table.append("]}");
                emit("visual", table.toString());
                runTests("practica.tdd.CalculatorTest", "addSeveralPairs");
            }
            case "assert-throws" -> {
                try {
                    calculator.divide(1, 0);
                    line("fail", "divide(1, 0) no lanzó");
                } catch (ArithmeticException e) {
                    line("fail", e.getClass().getSimpleName() + ": " + e.getMessage());
                    emit("visual", "{\"type\":\"throws\",\"name\":" + quote(e.getClass().getSimpleName())
                            + ",\"message\":" + quote(e.getMessage()) + "}");
                }
                runTests("practica.tdd.CalculatorTest", "divideThrowsWhenDivisorIsZero");
            }
            case "parse-parte1" -> {
                int a = parseador.obtenerParte1("2x - 1 = 0");
                line("info", "obtenerParte1(\"2x - 1 = 0\") = " + a);
                emit("visual", split("2x - 1 = 0", a, "-", parseador.obtenerParte2("2x - 1 = 0"), 0, "a"));
                runTests("practica.tdd.ecuacion.ParseadorTest", "obtenerParte1Unidades");
            }
            case "parse-parte2" -> {
                int mas = parseador.obtenerParte2("2x + 1 = 0");
                int menos = parseador.obtenerParte2("2x - 1 = 0");
                line("info", "\"2x + 1 = 0\"  b = " + mas);
                line("info", "\"2x - 1 = 0\"  b = " + menos);
                emit("visual", split("2x - 1 = 0", 2, "-", menos, 0, "b"));
                runTests("practica.tdd.ecuacion.ParseadorTest", "obtenerParte2Suma", "obtenerParte2Resta");
            }
            case "parse-operador" -> {
                String mas = parseador.obtenerOperador("2x + 1 = 0");
                String menos = parseador.obtenerOperador("2x - 1 = 0");
                line("info", "\"2x + 1 = 0\"  op = " + mas);
                line("info", "\"2x - 1 = 0\"  op = " + menos);
                emit("visual", split("2x + 1 = 0", 2, mas, 1, 0, "op"));
                runTests("practica.tdd.ecuacion.ParseadorTest", "obtenerOperadorSuma", "obtenerOperadorResta");
            }
            case "parse-parte3" -> {
                int c3 = parseador.obtenerParte3("2x + 1 = 3");
                int c10 = parseador.obtenerParte3("2x + 1 = 10");
                line("info", "obtenerParte3(\"2x + 1 = 3\") = " + c3);
                line("info", "obtenerParte3(\"2x + 1 = 10\") = " + c10);
                emit("visual", split("2x + 1 = 3", 2, "+", 1, c3, "c"));
                runTests("practica.tdd.ecuacion.ParseadorTest", "obtenerParte3Positivo");
            }
            case "parse-invalida" -> {
                try {
                    parseador.obtenerParte1("2x + 1");
                    line("fail", "no lanzó");
                } catch (IllegalArgumentException e) {
                    line("fail", e.getClass().getSimpleName() + ": " + e.getMessage());
                    emit("visual", "{\"type\":\"throws\",\"name\":" + quote(e.getClass().getSimpleName())
                            + ",\"message\":" + quote(e.getMessage()) + "}");
                }
                runTests("practica.tdd.ecuacion.ParseadorTest", "rechazaEcuacionMalFormada");
            }
            case "eq-menos" -> formula(ecuacion, "2x - 1 = 0", "solucionaEcuacionConMenos");
            case "eq-mas" -> formula(ecuacion, "2x + 1 = 0", "solucionaEcuacionConMas");
            case "eq-diez" -> formula(ecuacion, "2x + 1 = 10", "solucionaEcuacionConParte3Mayor0");
            case "eq-cero" -> {
                try {
                    ecuacion.obtenerResultado("0x + 1 = 3");
                    line("fail", "no lanzó");
                } catch (IllegalArgumentException e) {
                    line("fail", e.getClass().getSimpleName() + ": " + e.getMessage());
                    emit("visual", "{\"type\":\"throws\",\"name\":" + quote(e.getClass().getSimpleName())
                            + ",\"message\":" + quote(e.getMessage()) + "}");
                }
                runTests("practica.tdd.ecuacion.EcuacionPrimerGradoIntegrationTest", "rechazaCoeficienteCero");
            }
            case "mock-formula" -> {
                double x = resolverConStub(2, -1, 0, "2x - 1 = 0");
                line("info", "stub a=2, b=-1, c=0 (sin parsear la cadena)");
                line("info", "x = " + x);
                emit("visual", "{\"type\":\"mock\",\"a\":2,\"b\":-1,\"c\":0,\"x\":" + x + "}");
                runTests("practica.tdd.ecuacion.EcuacionPrimerGradoMockitoTest", "solucionaEcuacionConMenos");
            }
            case "first-softtek" -> {
                Calculator uno = new Calculator();
                Calculator dos = new Calculator();
                line("info", "Isolated: a.add(1,1)=" + uno.add(1, 1) + "  b.add(2,3)=" + dos.add(2, 3));
                line("info", "Repeatable: 1+1 siempre " + calculator.add(1, 1));
                emit("visual", "{\"type\":\"first\"}");
                runTests("practica.tdd.CalculatorTest", "addition");
            }
            default -> {
                emit("error", "{\"message\":" + quote("Paso no soportado en p1-java: " + step) + "}");
                System.exit(2);
            }
        }
    }

    private static void formula(EcuacionPrimerGrado ecuacion, String eq, String testMethod) {
        Parseador p = new Parseador();
        double x = ecuacion.obtenerResultado(eq);
        int a = p.obtenerParte1(eq);
        int b = p.obtenerParte2(eq);
        int c = p.obtenerParte3(eq);
        line("info", quoteBare(eq) + "  x = " + x);
        emit("visual", "{\"type\":\"formula\",\"equation\":" + quote(eq)
                + ",\"a\":" + a + ",\"b\":" + b + ",\"c\":" + c + ",\"x\":" + x + "}");
        runTests("practica.tdd.ecuacion.EcuacionPrimerGradoIntegrationTest", testMethod);
    }

    private static double resolverConStub(int a, int b, int c, String ecuacion) throws Exception {
        EcuacionPrimerGrado sut = new EcuacionPrimerGrado();
        Parseador stub = new Parseador() {
            @Override
            public int obtenerParte1(String e) {
                return a;
            }

            @Override
            public int obtenerParte2(String e) {
                return b;
            }

            @Override
            public int obtenerParte3(String e) {
                return c;
            }
        };
        Field campo = EcuacionPrimerGrado.class.getDeclaredField("parseador");
        campo.setAccessible(true);
        campo.set(sut, stub);
        return sut.obtenerResultado(ecuacion);
    }

    private static void runTests(String className, String... methods) {
        line("info", "JUnit en esta JVM → " + className.substring(className.lastIndexOf('.') + 1)
                + (methods.length == 0 ? " (clase completa)" : ""));
        LauncherDiscoveryRequestBuilder builder = LauncherDiscoveryRequestBuilder.request();
        if (methods.length == 0) {
            builder.selectors(DiscoverySelectors.selectClass(className));
        } else {
            for (String method : methods) {
                builder.selectors(DiscoverySelectors.selectMethod(className, method));
            }
        }
        LauncherDiscoveryRequest request = builder.build();
        Launcher launcher = LauncherFactory.create();
        SummaryGeneratingListener summary = new SummaryGeneratingListener();
        launcher.registerTestExecutionListeners(summary, new TestExecutionListenerPrinter());
        launcher.execute(request);
        var s = summary.getSummary();
        line(s.getTotalFailureCount() == 0 ? "pass" : "fail",
                "JUnit: " + s.getTestsSucceededCount() + " passed, "
                        + s.getTestsFailedCount() + " failed, "
                        + s.getTestsSkippedCount() + " skipped");
        if (s.getTotalFailureCount() > 0) {
            System.exit(1);
        }
    }

    private static final class TestExecutionListenerPrinter
            implements org.junit.platform.launcher.TestExecutionListener {
        @Override
        public void executionStarted(TestIdentifier testIdentifier) {
            if (testIdentifier.isTest()) {
                emit("junit", "{\"status\":\"started\",\"name\":" + quote(label(testIdentifier)) + "}");
            }
        }

        @Override
        public void executionFinished(TestIdentifier testIdentifier, TestExecutionResult result) {
            if (!testIdentifier.isTest()) {
                return;
            }
            String status = result.getStatus() == TestExecutionResult.Status.SUCCESSFUL ? "PASSED" : "FAILED";
            String kind = "PASSED".equals(status) ? "pass" : "fail";
            line(kind, label(testIdentifier) + "  " + status);
            emit("junit", "{\"status\":" + quote(status) + ",\"name\":" + quote(label(testIdentifier)) + "}");
        }

        private static String label(TestIdentifier id) {
            return id.getSource()
                    .filter(MethodSource.class::isInstance)
                    .map(MethodSource.class::cast)
                    .map(src -> src.getClassName() + "#" + src.getMethodName())
                    .orElse(id.getDisplayName());
        }
    }

    private static String split(String eq, int a, String op, int b, int c, String focus) {
        return "{\"type\":\"split\",\"equation\":" + quote(eq)
                + ",\"a\":" + a + ",\"op\":" + quote(op) + ",\"b\":" + b + ",\"c\":" + c
                + ",\"focus\":" + quote(focus) + "}";
    }

    private static void line(String kind, String text) {
        emit("line", "{\"kind\":" + quote(kind) + ",\"text\":" + quote(text) + "}");
    }

    private static void emit(String type, String jsonObject) {
        System.out.println("::live::{\"type\":" + quote(type) + ",\"payload\":" + jsonObject + "}");
    }

    private static String quoteBare(String s) {
        return "\"" + s + "\"";
    }

    private static String quote(String s) {
        if (s == null) {
            return "\"\"";
        }
        StringBuilder out = new StringBuilder("\"");
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            switch (ch) {
                case '\\' -> out.append("\\\\");
                case '"' -> out.append("\\\"");
                case '\n' -> out.append("\\n");
                case '\r' -> out.append("\\r");
                case '\t' -> out.append("\\t");
                default -> out.append(ch);
            }
        }
        return out.append('"').toString();
    }

    private LiveBridge() {
    }
}
