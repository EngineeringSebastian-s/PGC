export class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }

  divide(dividend: number, divisor: number): number {
    if (divisor === 0) {
      throw new Error("/ by zero");
    }
    return Math.trunc(dividend / divisor);
  }
}

export class Parseador {
  obtenerParte1(ecuacion: string): number {
    this.validar(ecuacion);
    const partes12 = this.obtenerPartes12(ecuacion);
    const parte1 = partes12[0].trim();
    return Number.parseInt(parte1.substring(0, parte1.length - 1), 10);
  }

  obtenerParte2(ecuacion: string): number {
    this.validar(ecuacion);
    const partes12 = this.obtenerPartes12(ecuacion);
    const parte2 = partes12[1].trim();
    const operador = this.obtenerOperador(ecuacion);
    if (operador === "-") {
      return Number.parseInt(parte2, 10) * -1;
    }
    return Number.parseInt(parte2, 10);
  }

  obtenerOperador(ecuacion: string): string {
    this.validar(ecuacion);
    if (ecuacion.indexOf("+") > 0) {
      return "+";
    }
    if (ecuacion.indexOf("-") > 0) {
      return "-";
    }
    throw new Error("La ecuación no tiene operador + o -: " + ecuacion);
  }

  obtenerParte3(ecuacion: string): number {
    this.validar(ecuacion);
    const partesEcuacion = ecuacion.split("=");
    return Number.parseInt(partesEcuacion[1].trim(), 10);
  }

  private obtenerPartes12(ecuacion: string): string[] {
    const partesEcuacion = ecuacion.split("=");
    const operador = this.obtenerOperador(ecuacion);
    return partesEcuacion[0].split(operador);
  }

  private validar(ecuacion: string): void {
    if (!ecuacion || !ecuacion.includes("=")) {
      throw new Error("Ecuación mal formada: " + ecuacion);
    }
  }
}

export class EcuacionPrimerGrado {
  constructor(private parseador: Parseador = new Parseador()) {}

  obtenerResultado(ecuacion: string): number {
    const parte1 = this.parseador.obtenerParte1(ecuacion);
    if (parte1 === 0) {
      throw new Error("El coeficiente de x no puede ser 0");
    }
    const parte2 = this.parseador.obtenerParte2(ecuacion);
    const parte3 = this.parseador.obtenerParte3(ecuacion);
    return (parte3 - parte2) / parte1;
  }
}

export class ParseadorStub extends Parseador {
  constructor(
    private a: number,
    private b: number,
    private c: number,
  ) {
    super();
  }

  override obtenerParte1(_ecuacion: string): number {
    return this.a;
  }

  override obtenerParte2(_ecuacion: string): number {
    return this.b;
  }

  override obtenerParte3(_ecuacion: string): number {
    return this.c;
  }
}

export function captura(fn: () => unknown): string {
  try {
    const valor = fn();
    return String(valor);
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return `${err.constructor.name}: ${err.message}`;
  }
}
