import {
  EcuacionPrimerGrado,
  Parseador,
  ParseadorStub,
  captura,
} from "@/lib/replica";
import type { Step } from "@/lib/walkthrough-types";

const parseador = new Parseador();
const ecuacion = new EcuacionPrimerGrado();

export const SOFTTEK_STEPS: Step[] = [
  {
    id: "parse-parte1",
    group: "softtek",
    method: "obtenerParte1",
    title: "a: el coeficiente de x",
    say: "De \"2x - 1 = 0\" saca el 2. No calcula x. SUT = Parseador.",
    why: "parte1 es a en ax + b = c. Si esto falla, la fórmula arranca mal.",
    code: `@Test
void obtenerParte1Unidades() {
  assertEquals(2, parseador.obtenerParte1("2x - 1 = 0"));
}`,
    captions: ["Lee 2x - 1 = 0", "Corta la x", "Devuelve 2"],
    run: () => ({
      lines: [
        { text: 'obtenerParte1("2x - 1 = 0") = ' + parseador.obtenerParte1("2x - 1 = 0"), kind: "info" },
        { text: "assertEquals(2, 2)  PASSED", kind: "pass" },
      ],
      visual: {
        type: "split",
        equation: "2x - 1 = 0",
        a: 2,
        op: "-",
        b: -1,
        c: 0,
        focus: "a",
      },
    }),
  },
  {
    id: "parse-parte2",
    group: "softtek",
    method: "obtenerParte2",
    title: "b: con el signo",
    say: "En la resta, b vale -1. En la suma, b vale +1. El parseador aplica el operador.",
    why: "El artículo usa b con signo para que x = (c − b) / a funcione igual en ambos casos.",
    code: `assertEquals(1, parseador.obtenerParte2("2x + 1 = 0"));
assertEquals(-1, parseador.obtenerParte2("2x - 1 = 0"));`,
    captions: ["Detecta + o −", "Lee el número", "Aplica el signo a b"],
    run: () => ({
      lines: [
        { text: '"2x + 1 = 0"  b = ' + parseador.obtenerParte2("2x + 1 = 0"), kind: "info" },
        { text: '"2x - 1 = 0"  b = ' + parseador.obtenerParte2("2x - 1 = 0"), kind: "info" },
        { text: "ambos asserts  PASSED", kind: "pass" },
      ],
      visual: {
        type: "split",
        equation: "2x - 1 = 0",
        a: 2,
        op: "-",
        b: -1,
        c: 0,
        focus: "b",
      },
    }),
  },
  {
    id: "parse-operador",
    group: "softtek",
    method: "obtenerOperador",
    title: "El + o el − de la izquierda",
    say: "No es el igual. Es el operador entre ax y b.",
    why: "Con ese carácter se parte la izquierda de la ecuación.",
    code: `assertEquals("+", parseador.obtenerOperador("2x + 1 = 0"));
assertEquals("-", parseador.obtenerOperador("2x - 1 = 0"));`,
    captions: ["Busca + en la cadena", "Si no, busca −", "Devuelve el símbolo"],
    run: () => ({
      lines: [
        { text: '"2x + 1 = 0"  op = ' + parseador.obtenerOperador("2x + 1 = 0"), kind: "info" },
        { text: '"2x - 1 = 0"  op = ' + parseador.obtenerOperador("2x - 1 = 0"), kind: "info" },
        { text: "assertEquals  PASSED", kind: "pass" },
      ],
      visual: {
        type: "split",
        equation: "2x + 1 = 0",
        a: 2,
        op: "+",
        b: 1,
        c: 0,
        focus: "op",
      },
    }),
  },
  {
    id: "parse-parte3",
    group: "softtek",
    method: "obtenerParte3",
    title: "c: lo de la derecha del igual",
    say: "Parte la cadena por = y lee el número de la derecha.",
    why: "c es el término independiente del otro lado. En el blog, a veces es 0 y a veces 10.",
    code: `@Test
void obtenerParte3Positivo() {
  assertEquals(3, parseador.obtenerParte3("2x + 1 = 3"));
}`,
    captions: ["Parte por =", "Lee la derecha", "Devuelve c"],
    run: () => ({
      lines: [
        { text: 'obtenerParte3("2x + 1 = 3") = ' + parseador.obtenerParte3("2x + 1 = 3"), kind: "info" },
        { text: 'obtenerParte3("2x + 1 = 10") = ' + parseador.obtenerParte3("2x + 1 = 10"), kind: "info" },
        { text: "assertEquals  PASSED", kind: "pass" },
      ],
      visual: {
        type: "split",
        equation: "2x + 1 = 3",
        a: 2,
        op: "+",
        b: 1,
        c: 3,
        focus: "c",
      },
    }),
  },
  {
    id: "parse-invalida",
    group: "softtek",
    method: "assertThrows",
    title: "Sin igual no hay ecuación",
    say: "validar() exige =. El unitario espera IllegalArgumentException.",
    why: "Un test unitario también cubre el error. Sin if en el test.",
    code: `assertThrows(IllegalArgumentException.class,
    () -> parseador.obtenerParte1("2x + 1"));`,
    captions: ["Pasa 2x + 1", "No hay =", "El test espera la excepción"],
    run: () => ({
      lines: [
        { text: captura(() => parseador.obtenerParte1("2x + 1")), kind: "fail" },
        { text: "assertThrows  PASSED", kind: "pass" },
      ],
      visual: {
        type: "throws",
        name: "IllegalArgumentException",
        message: "Ecuación mal formada: 2x + 1",
      },
    }),
  },
  {
    id: "eq-menos",
    group: "softtek",
    method: "obtenerResultado",
    title: "Integración: 2x − 1 = 0",
    say: "Parseador real + fórmula. x = (0 − (−1)) / 2 = 0.5",
    why: "Si el parseo se rompe, este test también falla. Por eso es integración.",
    code: `@Test
void solucionaEcuacionConMenos() {
  assertEquals(0.5, ecuacion.obtenerResultado("2x - 1 = 0"));
}`,
    captions: ["Parsea a=2, b=-1, c=0", "Aplica (c − b) / a", "x = 0.5"],
    run: () => {
      const x = ecuacion.obtenerResultado("2x - 1 = 0");
      return {
        lines: [
          { text: '"2x - 1 = 0"  x = ' + x, kind: "info" },
          { text: "assertEquals(0.5, " + x + ")  PASSED", kind: "pass" },
        ],
        visual: { type: "formula", equation: "2x - 1 = 0", a: 2, b: -1, c: 0, x },
      };
    },
  },
  {
    id: "eq-mas",
    group: "softtek",
    method: "obtenerResultado",
    title: "Integración: 2x + 1 = 0",
    say: "b es positivo. x = (0 − 1) / 2 = −0.5",
    why: "Segundo caso del artículo. Misma fórmula, otro signo.",
    code: `@Test
void solucionaEcuacionConMas() {
  assertEquals(-0.5, ecuacion.obtenerResultado("2x + 1 = 0"));
}`,
    captions: ["Parsea a=2, b=1, c=0", "(0 − 1) / 2", "x = −0.5"],
    run: () => {
      const x = ecuacion.obtenerResultado("2x + 1 = 0");
      return {
        lines: [
          { text: '"2x + 1 = 0"  x = ' + x, kind: "info" },
          { text: "assertEquals(-0.5, " + x + ")  PASSED", kind: "pass" },
        ],
        visual: { type: "formula", equation: "2x + 1 = 0", a: 2, b: 1, c: 0, x },
      };
    },
  },
  {
    id: "eq-diez",
    group: "softtek",
    method: "obtenerResultado",
    title: "Integración: 2x + 1 = 10",
    say: "c ya no es 0. x = (10 − 1) / 2 = 4.5",
    why: "Tercer caso del blog. Comprueba que parte3 entra en la fórmula.",
    code: `@Test
void solucionaEcuacionConParte3Mayor0() {
  assertEquals(4.5, ecuacion.obtenerResultado("2x + 1 = 10"));
}`,
    captions: ["Parsea a=2, b=1, c=10", "(10 − 1) / 2", "x = 4.5"],
    run: () => {
      const x = ecuacion.obtenerResultado("2x + 1 = 10");
      return {
        lines: [
          { text: '"2x + 1 = 10"  x = ' + x, kind: "info" },
          { text: "assertEquals(4.5, " + x + ")  PASSED", kind: "pass" },
        ],
        visual: { type: "formula", equation: "2x + 1 = 10", a: 2, b: 1, c: 10, x },
      };
    },
  },
  {
    id: "eq-cero",
    group: "softtek",
    method: "assertThrows",
    title: "a = 0 no se puede resolver",
    say: "No hay ecuación de primer grado. Se corta antes de dividir.",
    why: "La integración también cubre el error: excepción, no Infinity.",
    code: `assertThrows(IllegalArgumentException.class,
    () -> ecuacion.obtenerResultado("0x + 1 = 3"));`,
    captions: ["Parsea a = 0", "Rechaza", "assertThrows PASSED"],
    run: () => ({
      lines: [
        { text: captura(() => ecuacion.obtenerResultado("0x + 1 = 3")), kind: "fail" },
        { text: "assertThrows  PASSED", kind: "pass" },
      ],
      visual: {
        type: "throws",
        name: "IllegalArgumentException",
        message: "El coeficiente de x no puede ser 0",
      },
    }),
  },
  {
    id: "mock-formula",
    group: "softtek",
    method: "@Mock Parseador",
    title: "Mockito: solo la fórmula",
    say: "El parseador no lee la cadena. El test le ordena a=2, b=−1, c=0.",
    why: "Si Parseador tiene un bug, este test no se entera. Complementa la integración.",
    code: `@ExtendWith(MockitoExtension.class)
@Mock Parseador parseador;
@InjectMocks EcuacionPrimerGrado ecuacion;

when(parseador.obtenerParte1(eq)).thenReturn(2);
when(parseador.obtenerParte2(eq)).thenReturn(-1);
when(parseador.obtenerParte3(eq)).thenReturn(0);
assertEquals(0.5, ecuacion.obtenerResultado(eq));`,
    captions: ["Inyecta a, b, c", "Ignora el texto", "Valida (c − b) / a"],
    run: () => {
      const sut = new EcuacionPrimerGrado(new ParseadorStub(2, -1, 0));
      const x = sut.obtenerResultado("2x - 1 = 0");
      return {
        lines: [
          { text: "stub a=2, b=-1, c=0 (sin parsear)", kind: "info" },
          { text: "x = " + x, kind: "info" },
          { text: "assertEquals(0.5, " + x + ")  PASSED", kind: "pass" },
        ],
        visual: { type: "mock", a: 2, b: -1, c: 0, x },
      };
    },
  },
  {
    id: "first-softtek",
    group: "softtek",
    method: "FIRST",
    title: "FIRST sobre este código",
    say: "Señala cada letra en lo que acabas de ver, no en un párrafo suelto.",
    why: "JUnit es la herramienta. TDD es Timely: el test llega a tiempo.",
    code: `@BeforeEach  // Isolated
void setUp() { calculator = new Calculator(); }

assertEquals(2, calculator.add(1, 1));
// Fast, Repeatable, Self-validating`,
    captions: ["Cada test arranca limpio", "1+1 siempre es 2", "El assert decide"],
    run: () => ({
      lines: [
        { text: "Isolated: dos Calculator distintos", kind: "info" },
        { text: "Repeatable: 1+1 = 2", kind: "info" },
        { text: "Self-validating  PASSED", kind: "pass" },
      ],
      visual: { type: "first" },
    }),
  },
];
