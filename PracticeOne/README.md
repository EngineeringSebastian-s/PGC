# TDD

Publicado: 29 ago

Realizar los ejercicios que están en las siguientes páginas tal cual están ahí propuestos.

1. https://junit.org/junit5/docs/current/user-guide/#running-tests (Java y Kotlin)
2. https://blog.softtek.com/es/testing-unitario
3. CRUD en tres lenguajes distintos (no Java ni Kotlin; uno con framework de front). Ese punto no está en esta carpeta.

## Este repo (puntos 1 y 2)

- `p1-java` — JUnit 5 y ecuación de primer grado (Softtek)
- `p1-kotlin` — JUnit 5 equivalente
- `guia-web` — guía en http://localhost:43141

JDK 17+ (probado con 21). Node.js 18+ para la guía.

```powershell
cd p1-java
.\gradlew.bat test

cd ..\p1-kotlin
.\gradlew.bat test

cd ..\guia-web
npm install
npm run dev
```

En Linux/macOS: `./gradlew test`.
