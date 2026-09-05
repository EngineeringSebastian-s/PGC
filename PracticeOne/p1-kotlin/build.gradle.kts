plugins {
    kotlin("jvm") version "2.1.10"
}

group = "practica.tdd"
version = "1.0.0"

kotlin {
    jvmToolchain(21)
}

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(platform("org.junit:junit-bom:5.11.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testImplementation("org.junit.platform:junit-platform-launcher")
}

tasks.test {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")
    }
}

tasks.register<JavaExec>("live") {
    group = "application"
    description = "Ejecuta un paso de la guía"
    dependsOn("testClasses")
    classpath = sourceSets["test"].runtimeClasspath
    mainClass.set("practica.tdd.LiveBridge")
    jvmArgs(
        "-Dfile.encoding=UTF-8",
        "-Dstdout.encoding=UTF-8",
        "-Dstderr.encoding=UTF-8",
    )
    val stepArg = project.findProperty("liveStep")?.toString()
    if (!stepArg.isNullOrBlank()) {
        args(stepArg)
    }
}
