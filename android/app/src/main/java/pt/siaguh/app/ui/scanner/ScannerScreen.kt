package pt.siaguh.app.ui.scanner

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * Ecrã de scan QR.
 * Por agora usa input manual para testar sem câmara.
 * A integração com CameraX/ML Kit é adicionada na próxima iteração.
 */
@Composable
fun ScannerScreen(
    nomeUtilizador: String,
    role: String,
    onUtenteScanned: (Int) -> Unit,
    onLogout: () -> Unit
) {
    var inputNumUtente by remember { mutableStateOf("") }
    var erro by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier.fillMaxSize().padding(32.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Olá, $nomeUtilizador", fontSize = 16.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(
            roleLabel(role),
            fontSize = 13.sp,
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(bottom = 40.dp)
        )

        Text(
            "Scan QR da Pulseira",
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        Text(
            "Aponta a câmara para o QR code da pulseira do doente",
            fontSize = 13.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(bottom = 32.dp)
        )

        // Placeholder câmara — substituir por CameraX
        Card(
            modifier = Modifier.size(220.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
        ) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("📷\nCâmara\n(em breve)", textAlign = TextAlign.Center, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }

        Spacer(Modifier.height(24.dp))
        Text("Ou introduz manualmente:", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(8.dp))

        OutlinedTextField(
            value = inputNumUtente,
            onValueChange = { inputNumUtente = it.filter { c -> c.isDigit() }; erro = null },
            label = { Text("Nº Utente") },
            singleLine = true,
            isError = erro != null,
            supportingText = erro?.let { { Text(it, color = MaterialTheme.colorScheme.error) } },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(16.dp))

        Button(
            onClick = {
                val num = inputNumUtente.toIntOrNull()
                if (num == null || num <= 0) erro = "Número de utente inválido."
                else onUtenteScanned(num)
            },
            modifier = Modifier.fillMaxWidth().height(52.dp)
        ) {
            Text("Consultar Paciente", fontSize = 16.sp)
        }

        Spacer(Modifier.height(24.dp))

        TextButton(onClick = onLogout) {
            Text("Terminar Sessão", color = MaterialTheme.colorScheme.error)
        }
    }
}

private fun roleLabel(role: String) = when (role) {
    "medico"       -> "Médico"
    "enfermeiro"   -> "Enfermeiro"
    "admin"        -> "Administrador"
    "rececionista" -> "Rececionista"
    else           -> role
}
