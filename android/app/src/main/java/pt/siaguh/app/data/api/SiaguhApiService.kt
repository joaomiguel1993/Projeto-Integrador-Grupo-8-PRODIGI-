package pt.siaguh.app.data.api

import pt.siaguh.app.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface SiaguhApiService {

    // Auth
    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    // Utentes
    @GET("api/utentes/{num_utente}")
    suspend fun getUtente(@Path("num_utente") numUtente: Int): Response<Utente>

    @GET("api/utentes/{numutent}/antecedentes")
    suspend fun getAntecedentes(@Path("numutent") numUtente: Int): Response<List<Antecedente>>

    // Episódios
    @GET("api/episodios/")
    suspend fun getEpisodios(): Response<List<Episodio>>

    @GET("api/episodios/{cod_ep_urgenc}")
    suspend fun getEpisodio(@Path("cod_ep_urgenc") codEpUrgenc: Int): Response<Episodio>

    // Triagem
    @GET("api/triagens/{cod_ep_urgenc}")
    suspend fun getTriagem(@Path("cod_ep_urgenc") codEpUrgenc: Int): Response<Triagem>
}
