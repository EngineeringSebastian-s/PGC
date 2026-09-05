package practica.tdd

import org.junit.platform.engine.TestExecutionResult
import org.junit.platform.engine.discovery.DiscoverySelectors
import org.junit.platform.engine.support.descriptor.MethodSource
import org.junit.platform.launcher.TestExecutionListener
import org.junit.platform.launcher.TestIdentifier
import org.junit.platform.launcher.core.LauncherDiscoveryRequestBuilder
import org.junit.platform.launcher.core.LauncherFactory
import org.junit.platform.launcher.listeners.SummaryGeneratingListener
import kotlin.system.exitProcess

object LiveBridge {
    @JvmStatic
    fun main(args: Array<String>) {
        val step = args.firstOrNull()?.trim().orEmpty()
        emit("meta", """{"jvm":${quote(System.getProperty("java.home"))},"version":${quote(System.getProperty("java.version"))},"step":${quote(step)}}""")
        if (step.isEmpty()) {
            emit("error", """{"message":${quote("Falta el id del paso")}}""")
            exitProcess(2)
        }
        try {
            dispatch(step)
        } catch (e: Exception) {
            emit("error", """{"message":${quote(e.toString())}}""")
            e.printStackTrace(System.err)
            exitProcess(1)
        }
    }

    private fun dispatch(step: String) {
        val calculator = Calculator()
        when (step) {
            "kotlin-backticks" -> {
                val got = calculator.add(1, 1)
                line("info", "calculator.add(1, 1) = $got")
                line("info", "método: fun `suma 1 + 1`()")
                emit(
                    "visual",
                    """{"type":"kotlinName","source":${quote("fun `suma 1 + 1`()")},"report":${quote("suma 1 + 1")}}""",
                )
                runTests("suma 1 + 1")
            }
            "kotlin-per-class" -> {
                line("info", "PER_CLASS: una instancia de CalculatorTest")
                line("info", "@BeforeAll crearSuite → suiteInicializada = true")
                emit(
                    "visual",
                    """{"type":"timeline","events":[
                      {"label":"PER_CLASS","detail":"1 instancia"},
                      {"label":"@BeforeAll","detail":"suiteInicializada = true"},
                      {"label":"@BeforeEach","detail":"Calculator nuevo"},
                      {"label":"test","detail":"lee true, no vuelve a crear la clase"}
                    ]}""",
                )
                runTests("la clase de test se crea una sola vez")
            }
            "kotlin-before-each" -> {
                val a = Calculator()
                line("info", "misma CalculatorTest (PER_CLASS)")
                line("info", "@BeforeEach → Calculator()  add(1,1)=${a.add(1, 1)}")
                emit(
                    "visual",
                    """{"type":"timeline","events":[
                      {"label":"clase","detail":"se reutiliza"},
                      {"label":"setUp","detail":"Calculator nuevo"},
                      {"label":"suma 1 + 1","detail":"add → 2"}
                    ]}""",
                )
                runTests("suma 1 + 1")
            }
            "kotlin-throws" -> {
                try {
                    calculator.divide(1, 0)
                    line("fail", "divide(1, 0) no lanzó")
                } catch (e: ArithmeticException) {
                    line("fail", "${e.javaClass.simpleName}: ${e.message}")
                    emit(
                        "visual",
                        """{"type":"throws","name":${quote(e.javaClass.simpleName)},"message":${quote(e.message ?: "")}}""",
                    )
                }
                runTests("divide lanza cuando el divisor es cero")
            }
            "kotlin-parameterized" -> {
                val pairs = listOf(Triple(1, 1, 2), Triple(2, 3, 5), Triple(0, 8, 8), Triple(-2, 5, 3))
                val rows = pairs.joinToString(",") { (a, b, expected) ->
                    val got = calculator.add(a, b)
                    line("info", "$a + $b = $got  esperado $expected")
                    """{"expr":${quote("$a + $b")},"got":$got,"expected":$expected}"""
                }
                emit("visual", """{"type":"table","rows":[$rows]}""")
                runTests("suma varios pares")
            }
            else -> {
                emit("error", """{"message":${quote("Paso no soportado en p1-kotlin: $step")}}""")
                exitProcess(2)
            }
        }
    }

    private fun runTests(vararg methods: String) {
        line("info", "JUnit en esta JVM → CalculatorTest")
        val builder = LauncherDiscoveryRequestBuilder.request()
        methods.forEach { builder.selectors(DiscoverySelectors.selectMethod(CalculatorTest::class.java, it)) }
        val launcher = LauncherFactory.create()
        val summary = SummaryGeneratingListener()
        launcher.registerTestExecutionListeners(summary, Listener())
        launcher.execute(builder.build())
        val s = summary.summary
        line(
            if (s.totalFailureCount == 0L) "pass" else "fail",
            "JUnit: ${s.testsSucceededCount} passed, ${s.testsFailedCount} failed, ${s.testsSkippedCount} skipped",
        )
        if (s.totalFailureCount > 0L) {
            exitProcess(1)
        }
    }

    private class Listener : TestExecutionListener {
        override fun executionStarted(testIdentifier: TestIdentifier) {
            if (testIdentifier.isTest) {
                emit("junit", """{"status":"started","name":${quote(label(testIdentifier))}}""")
            }
        }

        override fun executionFinished(testIdentifier: TestIdentifier, result: TestExecutionResult) {
            if (!testIdentifier.isTest) return
            val status = if (result.status == TestExecutionResult.Status.SUCCESSFUL) "PASSED" else "FAILED"
            val kind = if (status == "PASSED") "pass" else "fail"
            line(kind, "${label(testIdentifier)}  $status")
            emit("junit", """{"status":${quote(status)},"name":${quote(label(testIdentifier))}}""")
        }

        private fun label(id: TestIdentifier): String {
            val src = id.source.orElse(null)
            return if (src is MethodSource) "${src.className}#${src.methodName}" else id.displayName
        }
    }

    private fun line(kind: String, text: String) {
        emit("line", """{"kind":${quote(kind)},"text":${quote(text)}}""")
    }

    private fun emit(type: String, jsonObject: String) {
        println("::live::{\"type\":${quote(type)},\"payload\":$jsonObject}")
    }

    private fun quote(value: String): String {
        val out = StringBuilder("\"")
        for (ch in value) {
            when (ch) {
                '\\' -> out.append("\\\\")
                '"' -> out.append("\\\"")
                '\n' -> out.append("\\n")
                '\r' -> out.append("\\r")
                '\t' -> out.append("\\t")
                else -> out.append(ch)
            }
        }
        return out.append('"').toString()
    }
}
