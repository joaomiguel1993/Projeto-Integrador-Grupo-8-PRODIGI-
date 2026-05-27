package pt.siaguh.app.ui.paciente

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import pt.siaguh.app.data.model.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PacienteScreen(
    viewModel: PacienteViewModel,
    userRole: String,
    onBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Ficha do Paciente") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Voltar")
                    }
                }
            )
        }
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            when {
                uiState.isLoading -> {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                }
                uiState.errorMessage != null -> {
                    Column(
                        modifier = Modifier.align(Alignment.Center).padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(uiState.errorMessage!!, color = MaterialTheme.colorScheme.error)
                        Spacer(Modifier.height(16.dp))
                        Button(onClick = onBack) { Text("Voltar") }
                    }
                }
                uiState.utente != null -> {
                    PacienteContent(uiState = uiState, userRole = userRole)
                }
            }
        }
    }
}

@Composable
private fun PacienteContent(uiState: PacienteUiState, userRole: String) {
    val utente = uiState.utente!!
    val isRececionista = userRole.lowercase() == "rececionista"

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Pulseira (cor triagem) - Ocultar para rececionista
        if (!isRececionista) {
            uiState.triagem?.let { PulseiraCard(it) }
        }

        // Dados pessoais
        SeccaoCard(titulo = "Dados do Utente") {
            InfoLinha("Nome", utente.nome)
            InfoLinha("NIF", utente.nif)

            // CORREÇÃO DA LINHA 81: Se datanasc for nulo, mostra "Não registada"
            val dataNascFormatada = utente.datanasc?.take(10) ?: "Não registada"
            InfoLinha("Data Nasc.", dataNascFormatada)

            InfoLinha("Sexo", if (utente.sexo == "M") "Masculino" else "Feminino")
            utente.localidade?.let { InfoLinha("Localidade", it) }
        }

        // Antecedentes - Ocultar para rececionista
        if (!isRececionista) {
            SeccaoCard(titulo = "Antecedentes (${uiState.antecedentes.size})") {
                if (uiState.antecedentes.isEmpty()) {
                    Text("Sem antecedentes registados.", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 14.sp)
                } else {
                    uiState.antecedentes.forEach { ant ->
                        Row(modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp)) {
                            Text("• ", color = MaterialTheme.colorScheme.primary)
                            Column {
                                ant.descricao?.let { Text(it, fontSize = 14.sp) }
                                ant.tipo?.let { Text(it, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant) }
                            }
                        }
                    }
                }
            }
        }

        // Episódio
        uiState.episodio?.let { ep ->
            SeccaoCard(titulo = "Episódio Atual") {
                InfoLinha("Código", ep.codepurgenc.toString())
                InfoLinha("Estado", ep.estado.replaceFirstChar { it.uppercase() })

                // PROTEÇÃO EXTRA: Se a data de entrada for nula por erro do sistema, não crasha
                val entradaFormatada = ep.datahoraentr?.take(16)?.replace("T", " ") ?: "Sem data"
                InfoLinha("Entrada", entradaFormatada)

                ep.datahorasaida?.let { InfoLinha("Saída", it.take(16).replace("T", " ")) }
            }
        }

        // Triagem detalhada - Ocultar para rececionista
        if (!isRececionista) {
            uiState.triagem?.let { tr ->
                SeccaoCard(titulo = "Triagem") {
                    tr.sintomas?.let { InfoLinha("Sintomas", it) }
                    tr.temperatura?.let { InfoLinha("Temperatura", "${it}°C") }
                    tr.freqcard?.let { InfoLinha("Freq. Cardíaca", "$it bpm") }
                    tr.freqresp?.let { InfoLinha("Freq. Respiratória", "$it rpm") }
                    tr.spo2?.let { InfoLinha("SpO2", "${it}%") }
                    if (tr.sistolica != null && tr.diastolica != null) {
                        InfoLinha("Tensão Arterial", "${tr.sistolica}/${tr.diastolica} mmHg")
                    }
                    tr.datahorainicio?.let { InfoLinha("Início Triagem", it.take(16).replace("T", " ")) }
                    tr.idfunc?.let { InfoLinha("ID Funcionário", it.toString()) }
                }
            }
        }
    }
}

@Composable
private fun PulseiraCard(triagem: Triagem) {
    val (bgColor, textColor, label) = when (triagem.cortriagem.lowercase()) {
        "vermelho"  -> Triple(Color(0xFFD32F2F), Color.White, "EMERGÊNCIA")
        "laranja"   -> Triple(Color(0xFFE65100), Color.White, "MUITO URGENTE")
        "amarelo"   -> Triple(Color(0xFFF9A825), Color.Black, "URGENTE")
        "verde"     -> Triple(Color(0xFF2E7D32), Color.White, "POUCO URGENTE")
        "azul"      -> Triple(Color(0xFF1565C0), Color.White, "NÃO URGENTE")
        else        -> Triple(Color(0xFF757575), Color.White, triagem.cortriagem.uppercase())
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(bgColor)
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("PULSEIRA", fontSize = 11.sp, color = textColor.copy(alpha = 0.8f), fontWeight = FontWeight.Medium)
                Text(label, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = textColor)
            }
        }
    }
}

@Composable
private fun SeccaoCard(titulo: String, content: @Composable ColumnScope.() -> Unit) {
    Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp)) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(titulo, fontWeight = FontWeight.Bold, fontSize = 15.sp, modifier = Modifier.padding(bottom = 10.dp))
            HorizontalDivider(modifier = Modifier.padding(bottom = 10.dp))
            content()
        }
    }
}

@Composable
private fun InfoLinha(label: String, valor: String) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 3.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.weight(0.4f))
        Text(valor, fontSize = 13.sp, fontWeight = FontWeight.Medium, modifier = Modifier.weight(0.6f))
    }
}
