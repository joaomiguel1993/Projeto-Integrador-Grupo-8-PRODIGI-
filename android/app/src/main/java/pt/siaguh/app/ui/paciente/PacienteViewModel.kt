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
    val isUpdating: Boolean = false,
    val errorMessage: String? = null,
    val utente: Utente? = null,
    val antecedentes: List<Antecedente> = emptyList(),
    val episodio: Episodio? = null,
    val triagem: Triagem? = null,
    val isEditingTriagem: Boolean = false
)

class PacienteViewModel(private val repository: UtenteRepository) : ViewModel() {

    private val _uiState = MutableStateFlow(PacienteUiState())
    val uiState: StateFlow<PacienteUiState> = _uiState.asStateFlow()

    fun carregarPacientePorEpisodio(codEpUrgenc: Int) {
        viewModelScope.launch {
            _uiState.value = PacienteUiState(isLoading = true)

            // 1. Obter o episódio primeiro
            val episodioResult = repository.getEpisodio(codEpUrgenc)

            if (episodioResult is Result.Error) {
                _uiState.value = PacienteUiState(errorMessage = episodioResult.message)
                return@launch
            }

            val episodio = (episodioResult as Result.Success).data
            val numUtente = episodio.numutent

            // 2. Com o numUtente, obter utente, antecedentes e triagem em paralelo
            val utenteDeferred = async { repository.getUtente(numUtente) }
            val antecedentesDeferred = async { repository.getAntecedentes(numUtente) }
            val triagemDeferred = async { repository.getTriagem(codEpUrgenc) }

            val utenteResult = utenteDeferred.await()
            val antecedentesResult = antecedentesDeferred.await()
            val triagemResult = triagemDeferred.await()

            if (utenteResult is Result.Error) {
                _uiState.value = PacienteUiState(errorMessage = utenteResult.message)
                return@launch
            }

            _uiState.value = PacienteUiState(
                isLoading = false,
                utente = (utenteResult as Result.Success).data,
                antecedentes = if (antecedentesResult is Result.Success) antecedentesResult.data else emptyList(),
                episodio = episodio,
                triagem = if (triagemResult is Result.Success) triagemResult.data else null
            )
        }
    }

    fun setEditingTriagem(editing: Boolean) {
        _uiState.value = _uiState.value.copy(isEditingTriagem = editing)
    }

    fun updateTriagem(novaTriagem: Triagem) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isUpdating = true, errorMessage = null)
            val result = repository.updateTriagem(novaTriagem.codepurgenc, novaTriagem)
            
            if (result is Result.Success) {
                _uiState.value = _uiState.value.copy(
                    isUpdating = false,
                    isEditingTriagem = false,
                    triagem = result.data
                )
            } else if (result is Result.Error) {
                _uiState.value = _uiState.value.copy(
                    isUpdating = false,
                    errorMessage = result.message
                )
            }
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
