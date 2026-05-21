package pt.siaguh.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import pt.siaguh.app.ui.SiaguhNavHost
import pt.siaguh.app.ui.theme.SIAGUHTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            SIAGUHTheme {
                SiaguhNavHost()
            }
        }
    }
}