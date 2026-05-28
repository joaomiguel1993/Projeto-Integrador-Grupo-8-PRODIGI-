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
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import pt.siaguh.app.R
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
                title = { Text(stringResource(R.string.patient_file_title)) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            Icons.AutoMirrored.Filled.ArrowBack, 
                            contentDescription = stringResource(R.string.action_back)
                        )
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
                        Button(onClick = onBack) { Text(stringResource(R.string.action_back)) }
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
        SeccaoCard(titulo = stringResource(R.string.section_user_data)) {
            InfoLinha(stringResource(R.string.label_name), utente.nome)
            InfoLinha(stringResource(R.string.label_nif), utente.nif)

            val dataNascFormatada = utente.datanasc?.take(10) ?: stringResource(R.string.not_registered)
            InfoLinha(stringResource(R.string.label_birth_date), dataNascFormatada)

            InfoLinha(
                stringResource(R.string.label_gender), 
                if (utente.sexo == "M") stringResource(R.string.gender_male) else stringResource(R.string.gender_female)
            )
            utente.localidade?.let { InfoLinha(stringResource(R.string.label_locality), it) }
        }

        // Antecedentes - Ocultar para rececionista
        if (!isRececionista) {
            SeccaoCard(titulo = stringResource(R.string.section_antecedents, uiState.antecedentes.size)) {
                if (uiState.antecedentes.isEmpty()) {
                    Text(
                        text = stringResource(R.string.no_antecedents), 
                        color = MaterialTheme.colorScheme.onSurfaceVariant, 
                        fontSize = 14.sp
                    )
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
            SeccaoCard(titulo = stringResource(R.string.section_current_episode)) {
                InfoLinha(stringResource(R.string.label_code), ep.codepurgenc.toString())
                InfoLinha(stringResource(R.string.label_status), ep.estado.replaceFirstChar { it.uppercase() })

                val entradaFormatada = ep.datahoraentr?.take(16)?.replace("T", " ") ?: stringResource(R.string.no_date)
                InfoLinha(stringResource(R.string.label_entry), entradaFormatada)

                ep.datahorasaida?.let { InfoLinha(stringResource(R.string.label_exit), it.take(16).replace("T", " ")) }
            }
        }

        // Triagem detalhada - Ocultar para rececionista
        if (!isRececionista) {
            uiState.triagem?.let { tr ->
                SeccaoCard(titulo = stringResource(R.string.section_triage)) {
                    tr.sintomas?.let { InfoLinha(stringResource(R.string.label_symptoms), it) }
                    tr.temperatura?.let { InfoLinha(stringResource(R.string.label_temperature), "${it}°C") }
                    tr.freqcard?.let { InfoLinha(stringResource(R.string.label_heart_rate), "$it bpm") }
                    tr.freqresp?.let { InfoLinha(stringResource(R.string.label_respiratory_rate), "$it rpm") }
                    tr.spo2?.let { InfoLinha(stringResource(R.string.label_spo2), "${it}%") }
                    if (tr.sistolica != null && tr.diastolica != null) {
                        InfoLinha(stringResource(R.string.label_blood_pressure), "${tr.sistolica}/${tr.diastolica} mmHg")
                    }
                    tr.datahorainicio?.let { InfoLinha(stringResource(R.string.label_triage_start), it.take(16).replace("T", " ")) }
                    tr.idfunc?.let { InfoLinha(stringResource(R.string.label_employee_id), it.toString()) }
                }
            }
        }
    }
}

@Composable
private fun PulseiraCard(triagem: Triagem) {
    val (bgColor, textColor, labelRes) = when (triagem.cortriagem.lowercase()) {
        "vermelho"  -> Triple(Color(0xFFD32F2F), Color.White, R.string.triage_emergency)
        "laranja"   -> Triple(Color(0xFFE65100), Color.White, R.string.triage_very_urgent)
        "amarelo"   -> Triple(Color(0xFFF9A825), Color.Black, R.string.triage_urgent)
        "verde"     -> Triple(Color(0xFF2E7D32), Color.White, R.string.triage_not_so_urgent)
        "azul"      -> Triple(Color(0xFF1565C0), Color.White, R.string.triage_non_urgent)
        else        -> Triple(Color(0xFF757575), Color.White, null)
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
                Text(
                    text = stringResource(R.string.label_wristband), 
                    fontSize = 11.sp, 
                    color = textColor.copy(alpha = 0.8f), 
                    fontWeight = FontWeight.Medium
                )
                Text(
                    text = if (labelRes != null) stringResource(labelRes) else triagem.cortriagem.uppercase(), 
                    fontSize = 20.sp, 
                    fontWeight = FontWeight.Bold, 
                    color = textColor
                )
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
