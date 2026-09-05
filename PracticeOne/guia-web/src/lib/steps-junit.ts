import { Calculator } from "@/lib/replica";
import type { Step } from "@/lib/walkthrough-types";

const calculator = new Calculator();

export const JUNIT_STEPS: Step[] = [
  {
    id: "at-test",
    group: "junit",
    method: "@Test",
    title: "Marca el método como test",
    say: "Sin @Test, JUnit no ejecuta el método. Con @Test, addition entra en la suite.",
    why: "Es el ejemplo mínimo del User Guide. El SUT es Calculator.",
    code: `@Test
void addition() {
  Calculator calculator = new Calculator();
  assertEquals(2, calculator.add(1, 1));
}`,
    captions: ["JUnit encuentra @Test", "Ejecuta addition()", "Entra en el reporte"],
    run: () => ({
      lines: [
        { text: "descubierto: addition()", kind: "info" },
        { text: "add(1, 1) = " + calculator.add(1, 1), kind: "info" },
        { text: "addition  PASSED", kind: "pass" },
      ],
      visual: { type: "sum", left: 1, right: 1, result: calculator.add(1, 1) },
    }),
  },
  {
    id: "assert-equals",
    group: "junit",
    method: "assertEquals",
    title: "Compara esperado y obtenido",
    say: "El primer argumento es lo que quieres. El segundo es lo que salió. Si coinciden, PASSED.",
    why: "Self-validating: no tienes que leer la consola a mano para saber si está bien.",
    code: `assertEquals(2, calculator.add(1, 1));
// esperado 2, obtenido add(1, 1)`,
    captions: ["Fija el esperado: 2", "Obtiene add(1, 1)", "Compara los dos valores"],
    run: () => {
      const actual = calculator.add(1, 1);
      return {
        lines: [
          { text: "esperado = 2", kind: "info" },
          { text: "obtenido = " + actual, kind: "info" },
          { text: "assertEquals(2, " + actual + ")  PASSED", kind: "pass" },
        ],
        visual: { type: "assert", expected: 2, actual },
      };
    },
  },
  {
    id: "before-each",
    group: "junit",
    method: "@BeforeEach",
    title: "SUT nuevo antes de cada test",
    say: "setUp corre dos veces: una antes de addition y otra antes de divide. Isolated.",
    why: "Si reutilizaras el mismo Calculator sucio, un test podría contaminar al siguiente.",
    code: `Calculator calculator;

@BeforeEach
void setUp() {
  calculator = new Calculator();
}

@Test void addition() { ... }
@Test void divideThrows...() { ... }`,
    captions: ["Empieza addition", "setUp crea Calculator", "Empieza el siguiente test: otro setUp"],
    run: () => ({
      lines: [
        { text: "@BeforeEach setUp → new Calculator()  (test addition)", kind: "info" },
        { text: "addition  PASSED", kind: "pass" },
        { text: "@BeforeEach setUp → new Calculator()  (test divide)", kind: "info" },
        { text: "divideThrows  PASSED", kind: "pass" },
      ],
      visual: {
        type: "timeline",
        events: [
          { label: "setUp", detail: "Calculator #1" },
          { label: "addition", detail: "usa #1" },
          { label: "setUp", detail: "Calculator #2" },
          { label: "divideThrows", detail: "usa #2, no #1" },
        ],
      },
    }),
  },
  {
    id: "parameterized",
    group: "junit",
    method: "@ParameterizedTest",
    title: "Un método, varias filas",
    say: "@CsvSource alimenta a, b y expected. Cuatro filas = cuatro ejecuciones aisladas.",
    why: "No copies el mismo assert cuatro veces. Repeatable: cada par da siempre el mismo resultado.",
    code: `@ParameterizedTest(name = "{0} + {1} = {2}")
@CsvSource({
  "1, 1, 2",
  "2, 3, 5",
  "0, 8, 8",
  "-2, 5, 3"
})
void addSeveralPairs(int a, int b, int expected) {
  assertEquals(expected, calculator.add(a, b));
}`,
    captions: ["Lee la fila del CSV", "Llama add(a, b)", "assertEquals con expected"],
    run: () => {
      const rows = [
        { expr: "1 + 1", got: calculator.add(1, 1), expected: 2 },
        { expr: "2 + 3", got: calculator.add(2, 3), expected: 5 },
        { expr: "0 + 8", got: calculator.add(0, 8), expected: 8 },
        { expr: "-2 + 5", got: calculator.add(-2, 5), expected: 3 },
      ];
      return {
        lines: rows.map((row) => ({
          text: `${row.expr} = ${row.got}  esperado ${row.expected}  PASSED`,
          kind: "pass" as const,
        })),
        visual: { type: "table", rows },
      };
    },
  },
  {
    id: "assert-throws",
    group: "junit",
    method: "assertThrows",
    title: "El fallo correcto es una excepción",
    say: "JUnit no espera un número. Espera ArithmeticException y el mensaje / by zero.",
    why: "Si divide no lanzara, el test fallaría. El error de producción es el éxito del test.",
    code: `@Test
void divideThrowsWhenDivisorIsZero() {
  ArithmeticException e = assertThrows(
      ArithmeticException.class,
      () -> calculator.divide(1, 0));
  assertEquals("/ by zero", e.getMessage());
}`,
    captions: ["Llama divide(1, 0)", "Captura ArithmeticException", "Comprueba el mensaje"],
    run: () => ({
      lines: [
        { text: "divide(1, 0) lanza ArithmeticException: / by zero", kind: "fail" },
        { text: "assertThrows(ArithmeticException)  PASSED", kind: "pass" },
        { text: 'assertEquals("/ by zero", mensaje)  PASSED', kind: "pass" },
      ],
      visual: { type: "throws", name: "ArithmeticException", message: "/ by zero" },
    }),
  },
];
