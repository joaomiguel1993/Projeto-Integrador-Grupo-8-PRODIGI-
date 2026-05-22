package pt.siaguh.app.data.repository

import pt.siaguh.app.data.api.SiaguhApiService
import pt.siaguh.app.data.model.LoginRequest
import pt.siaguh.app.data.model.LoginResponse
import pt.siaguh.app.util.Result
import pt.siaguh.app.util.TokenManager

class AuthRepository(
    private val api: SiaguhApiService,
    private val tokenManager: TokenManager
) {

    suspend fun login(username: String, password: String): Result<LoginResponse> {
        return try {
            val response = api.login(LoginRequest(username, password))
            if (response.isSuccessful) {
                val body = response.body()!!
                tokenManager.saveToken(body.username)
                tokenManager.saveRole(body.role)
                Result.Success(body)
            } else {
                val msg = when (response.code()) {
                    401  -> "Credenciais inválidas."
                    422  -> "Dados em falta ou inválidos."
                    else -> "Erro ${response.code()}."
                }
                Result.Error(msg)
            }
        } catch (e: Exception) {
            Result.Error("Sem ligação ao servidor.")
        }
    }

    suspend fun logout() = tokenManager.clear()

    suspend fun isLoggedIn() = tokenManager.isLoggedIn()
}