package pt.siaguh.app.ui.main

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import pt.siaguh.app.data.model.LoginResponse

@Composable
fun MainScreen(loginResponse: LoginResponse) {
    val roleLabel = when (loginResponse.role) {
        "medico"       -> "Médico"
        "enfermeiro"   -> "Enfermeiro"
        "admin"        -> "Administrador"
        "rececionista" -> "Rececionista"
        else           -> loginResponse.role.replaceFirstChar { it.uppercase() }
    }

    Column(
        modifier = Modifier.fillMaxSize().padding(32.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Bem-vindo,",
            fontSize = 18.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text = loginResponse.nome,
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onBackground,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        AssistChip(onClick = {}, label = { Text(roleLabel) })

        if (loginResponse.hospitais.isNotEmpty()) {
            Spacer(modifier = Modifier.height(24.dp))
            Text(
                text = "Hospital(is):",
                fontSize = 14.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(bottom = 8.dp)
            )
            loginResponse.hospitais.forEach { hospital ->
                Text(
                    text = hospital.nome,
                    fontSize = 15.sp,
                    modifier = Modifier.padding(vertical = 2.dp)
                )
            }
        }
    }
}