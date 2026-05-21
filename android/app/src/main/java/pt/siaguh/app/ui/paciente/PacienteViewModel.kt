package pt.siaguh.app.ui.paciente

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import pt.siaguh.app.data.model.*
import pt.siaguh.app.data.repository.UtenteRepository
import pt.siaguh.app.util.Result

data class PacienteUiState(
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val utente: Utente? = null,
    val antecedentes: List<Antecedente> = emptyList(),
    val episodio: Episodio? = null,
    val triagem: Triagem? = null
)

class PacienteViewModel(private val repository: UtenteRepository) : ViewModel() {

    private val _uiState = MutableStateFlow(PacienteUiState())
    val uiState: StateFlow<PacienteUiState> = _uiState.asStateFlow()

    fun carregarPaciente(numUtente: Int) {
        viewModelScope.launch {
            _uiState.value = PacienteUiState(isLoading = true)

            // Utente e antecedentes em paralelo
            val utenteDeferred = async { repository.getUtente(numUtente) }
            val antecedentesDeferred = async { repository.getAntecedentes(numUtente) }
            val episodioDeferred = async { repository.getEpisodioAtivo(numUtente) }

            val utenteResult = utenteDeferred.await()
            val antecedentesResult = antecedentesDeferred.await()
            val episodioResult = episodioDeferred.await()

            if (utenteResult is Result.Error) {
                _uiState.value = PacienteUiState(errorMessage = utenteResult.message)
                return@launch
            }

            val utente = (utenteResult as Result.Success).data
            val antecedentes = if (antecedentesResult is Result.Success) antecedentesResult.data else emptyList()
            val episodio = if (episodioResult is Result.Success) episodioResult.data else null

            // Triagem só se houver episódio
            val triagem = episodio?.let {
                val r = repository.getTriagem(it.codepurgenc)
                if (r is Result.Success) r.data else null
            }

            _uiState.value = PacienteUiState(
                isLoading = false,
                utente = utente,
                antecedentes = antecedentes,
                episodio = episodio,
                triagem = triagem
            )
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }

    class Factory(private val repository: UtenteRepository) : ViewModelProvider.Factory {
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            @Suppress("UNCHECKED_CAST")
            return PacienteViewModel(repository) as T
        }
    }
}
