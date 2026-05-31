package pt.siaguh.app.data.api

import pt.siaguh.app.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface SiaguhApiService {

    // Auth
    @POST("api/v1/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    // Utentes
    @GET("api/v1/utentes/{num_utente}")
    suspend fun getUtente(@Path("num_utente") numUtente: Int): Response<Utente>

    @GET("api/v1/utente-antecedentes/utente/{num_utente}")
    suspend fun getAntecedentes(@Path("num_utente") numUtente: Int): Response<List<Antecedente>>

    // Episódios
    @GET("api/v1/episodios/")
    suspend fun getEpisodios(): Response<List<Episodio>>

    @GET("api/v1/episodios/{cod_ep_urgenc}")
    suspend fun getEpisodio(@Path("cod_ep_urgenc") codEpUrgenc: Int): Response<Episodio>

    @GET("api/v1/episodios/utente/{num_utente}")
    suspend fun getEpisodiosPorUtente(@Path("num_utente") numUtente: Int): Response<List<Episodio>>

    // Triagem
    @GET("api/v1/triagens/{cod_ep_urgenc}")
    suspend fun getTriagem(@Path("cod_ep_urgenc") codEpUrgenc: Int): Response<Triagem>

    @PUT("api/v1/triagens/{cod_ep_urgenc}")
    suspend fun updateTriagem(@Path("cod_ep_urgenc") codEpUrgenc: Int, @Body triagem: Triagem): Response<Triagem>
}
