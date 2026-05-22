package pt.siaguh.app.util

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking

private val Context.dataStore by preferencesDataStore(name = "siaguh_prefs")

class TokenManager(private val context: Context) {

    companion object {
        private val KEY_TOKEN = stringPreferencesKey("jwt_token")
        private val KEY_ROLE  = stringPreferencesKey("user_role")
    }

    suspend fun saveToken(token: String) {
        context.dataStore.edit { it[KEY_TOKEN] = token }
    }

    suspend fun saveRole(role: String) {
        context.dataStore.edit { it[KEY_ROLE] = role }
    }

    suspend fun getToken(): String? =
        context.dataStore.data.map { it[KEY_TOKEN] }.firstOrNull()

    suspend fun getRole(): String? =
        context.dataStore.data.map { it[KEY_ROLE] }.firstOrNull()

    fun getTokenBlocking(): String? = runBlocking { getToken() }

    suspend fun clear() { context.dataStore.edit { it.clear() } }

    suspend fun isLoggedIn(): Boolean = !getToken().isNullOrBlank()
}
