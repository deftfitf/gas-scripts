package conventions

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import java.nio.file.Files
import java.nio.file.Paths

tasks.register<Exec>("claspLogin") {
    commandLine("npx", "clasp", "login")
}

tasks.register<Exec>("claspCreate") {
    doFirst {
        val projectName: String = project.name
        commandLine("npx", "clasp", "create",
                "--title", projectName,
                "--rootDir", ".",
                "--type", "standalone")
    }
    // Rewrite timezone
    doLast {
        val jsonPath = Paths.get(project.projectDir.absolutePath, "appsscript.json")
        val json = ObjectMapper().readTree(Files.newBufferedReader(jsonPath)) as ObjectNode
        json.put("timeZone", "Asia/Tokyo")
        Files.newBufferedWriter(jsonPath).use { ObjectMapper().writeValue(it, json) }
    }
}

tasks.register<Exec>("claspPush") {
    commandLine("npx", "clasp", "push", "-f")
}

tasks.register<Exec>("claspPull") {
    commandLine("npx", "clasp", "pull")
}

tasks.register<Exec>("claspDeploy") {
    commandLine("npx", "clasp", "deploy")
}

tasks.register<Exec>("claspVersions") {
    commandLine("npx", "clasp", "versions")
}
