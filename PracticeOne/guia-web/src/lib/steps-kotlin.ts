import { Calculator, captura } from "@/lib/replica";
import type { Step } from "@/lib/walkthrough-types";

const calculator = new Calculator();

export const KOTLIN_STEPS: Step[] = [
  {
    id: "kotlin-backticks",
    group: "kotlin",
    method: "backticks",
    title: "Nombre de test con espacios",
    say: "En Kotlin el nombre va entre backticks. En el reporte se lee como una frase, no como addition().",
    why: "El User Guide lo recomienda. El método sigue siendo un test normal con @Test.",
    code: `@Test
fun \`suma 1 + 1\`() {
  val calculator = Calculator()
  assertEquals(2, calculator.add(1, 1))
}`,
    captions: ["Compila el nombre entre backticks", "Ejecuta el test", "El reporte muestra la frase"],
    run: () => ({
      lines: [
        { text: "método: fun `suma 1 + 1`()", kind: "info" },
        { text: "add(1, 1) = " + calculator.add(1, 1), kind: "info" },
        { text: "reporte: suma 1 + 1  PASSED", kind: "pass" },
      ],
      visual: {
        type: "kotlinName",
        source: "fun `suma 1 + 1`()",
        report: "suma 1 + 1",
      },
    }),
  },
  {
    id: "kotlin-per-class",
    group: "kotlin",
    method: "@TestInstance(PER_CLASS)",
    title: "Una instancia para toda la clase",
    say: "En Kotlin no hay static. PER_CLASS deja usar @BeforeAll en un método de instancia. La clase se crea una vez.",
    why: "El User Guide lo recomienda para Kotlin. @BeforeEach sigue corriendo antes de cada test.",
    code: `@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CalculatorTest {
  var suiteInicializada = false

  @BeforeAll
  fun crearSuite() { suiteInicializada = true }

  @Test
  fun \`la clase de test se crea una sola vez\`() {
    assertEquals(true, suiteInicializada)
  }
}`,
    captions: ["Crea la clase una vez", "@BeforeAll marca suiteInicializada", "El test lee true"],
    run: () => ({
      lines: [
        { text: "new CalculatorTest()  (una sola vez)", kind: "info" },
        { text: "@BeforeAll crearSuite → suiteInicializada = true", kind: "info" },
        { text: "assertEquals(true, true)  PASSED", kind: "pass" },
      ],
      visual: {
        type: "timeline",
        events: [
          { label: "PER_CLASS", detail: "1 instancia" },
          { label: "@BeforeAll", detail: "suiteInicializada = true" },
          { label: "@BeforeEach", detail: "Calculator nuevo" },
          { label: "test", detail: "lee true, no vuelve a crear la clase" },
        ],
      },
    }),
  },
  {
    id: "kotlin-before-each",
    group: "kotlin",
    method: "@BeforeEach",
    title: "También en Kotlin, SUT fresco",
    say: "Aunque la clase sea PER_CLASS, el Calculator se recrea en cada test.",
    why: "PER_CLASS no rompe Isolated. Lo que se comparte es la clase de test, no el SUT.",
    code: `@BeforeEach
fun setUp() {
  calculator = Calculator()
}

@Test
fun \`suma 1 + 1\`() {
  assertEquals(2, calculator.add(1, 1))
}`,
    captions: ["La clase ya existe", "setUp crea Calculator", "El test usa esa instancia"],
    run: () => ({
      lines: [
        { text: "misma CalculatorTest (PER_CLASS)", kind: "info" },
        { text: "@BeforeEach → Calculator()", kind: "info" },
        { text: "suma 1 + 1  PASSED", kind: "pass" },
      ],
      visual: {
        type: "timeline",
        events: [
          { label: "clase", detail: "se reutiliza" },
          { label: "setUp", detail: "Calculator nuevo" },
          { label: "suma 1 + 1", detail: "add → 2" },
        ],
      },
    }),
  },
  {
    id: "kotlin-throws",
    group: "kotlin",
    method: "assertThrows",
    title: "Excepción en Kotlin",
    say: "Misma idea que en Java. El lambda va en un bloque. Se comprueba el message.",
    why: "JUnit es el mismo en la JVM. Cambia la sintaxis, no el contrato.",
    code: `@Test
fun \`divide lanza cuando el divisor es cero\`() {
  val exception = assertThrows(ArithmeticException::class.java) {
    calculator.divide(1, 0)
  }
  assertEquals("/ by zero", exception.message)
}`,
    captions: ["Llama divide(1, 0)", "assertThrows captura", "Lee exception.message"],
    run: () => ({
      lines: [
        { text: captura(() => calculator.divide(1, 0)), kind: "fail" },
        { text: "assertThrows(ArithmeticException)  PASSED", kind: "pass" },
      ],
      visual: { type: "throws", name: "ArithmeticException", message: "/ by zero" },
    }),
  },
  {
    id: "kotlin-parameterized",
    group: "kotlin",
    method: "@ParameterizedTest",
    title: "CsvSource en Kotlin",
    say: "Los backticks también sirven en el test parametrizado: suma varios pares.",
    why: "Demuestra que leíste más que el hola mundo del User Guide.",
    code: `@ParameterizedTest(name = "{0} + {1} = {2}")
@CsvSource("1, 1, 2", "2, 3, 5", "0, 8, 8", "-2, 5, 3")
fun \`suma varios pares\`(a: Int, b: Int, expected: Int) {
  assertEquals(expected, calculator.add(a, b))
}`,
    captions: ["Cada fila es una ejecución", "add(a, b)", "assertEquals"],
    run: () => {
      const rows = [
        { expr: "1 + 1", got: calculator.add(1, 1), expected: 2 },
        { expr: "2 + 3", got: calculator.add(2, 3), expected: 5 },
        { expr: "0 + 8", got: calculator.add(0, 8), expected: 8 },
        { expr: "-2 + 5", got: calculator.add(-2, 5), expected: 3 },
      ];
      return {
        lines: rows.map((row) => ({
          text: `${row.expr} = ${row.got}  PASSED`,
          kind: "pass" as const,
        })),
        visual: { type: "table", rows },
      };
    },
  },
];
