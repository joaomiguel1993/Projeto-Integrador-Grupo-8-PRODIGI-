package pt.siaguh.app.data.repository

import pt.siaguh.app.data.api.SiaguhApiService
import pt.siaguh.app.data.model.*
import pt.siaguh.app.util.Result

class UtenteRepository(private val api: SiaguhApiService) {

    suspend fun getUtente(numUtente: Int): Result<Utente> = safeCall {
        api.getUtente(numUtente)
    }

    suspend fun getAntecedentes(numUtente: Int): Result<List<Antecedente>> = safeCall {
        api.getAntecedentes(numUtente)
    }

    suspend fun getEpisodio(codEpUrgenc: Int): Result<Episodio> = safeCall {
        api.getEpisodio(codEpUrgenc)
    }

    suspend fun getEpisodioAtivo(numUtente: Int): Result<Episodio> {
        return try {
            val response = api.getEpisodiosPorUtente(numUtente)
            if (response.isSuccessful) {
                val episodio = response.body()
                    ?.sortedByDescending { it.datahoraentr }
                    ?.firstOrNull()
                if (episodio != null) Result.Success(episodio)
                else Result.Error("Sem episódio ativo para este utente.")
            } else {
                Result.Error("Erro ${response.code()} ao obter episódios.")
            }
        } catch (e: Exception) {
            Result.Error("Sem ligação ao servidor.")
        }
    }

    suspend fun getTriagem(codEpUrgenc: Int): Result<Triagem> = safeCall {
        api.getTriagem(codEpUrgenc)
    }

    suspend fun updateTriagem(codEpUrgenc: Int, triagem: Triagem): Result<Triagem> = safeCall {
        api.updateTriagem(codEpUrgenc, triagem)
    }

    private suspend fun <T> safeCall(call: suspend () -> retrofit2.Response<T>): Result<T> {
        return try {
            val response = call()
            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) Result.Success(body)
                else Result.Error("Servidor devolveu dados vazios.")
            } else {
                val msg = when (response.code()) {
                    404 -> "O registo solicitado não foi encontrado."
                    401 -> "Sessão expirada. Por favor, faça login novamente."
                    403 -> "Não tem permissão para aceder a estes dados."
                    500 -> "Erro interno do servidor. Tente mais tarde."
                    else -> "Erro ${response.code()} ao comunicar com o servidor."
                }
                Result.Error(msg)
            }
        } catch (e: Exception) {
            Result.Error("Sem ligação ao servidor. Verifique a sua internet.")
        }
    }
}
