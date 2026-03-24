Projeto-Integrador-Grupo-8-PRODIGI-/
│
├── backend/
│   ├── SQL/
│   │   ├── createTables.sql      ✅ já existe
│   │   └── populateDB.sql        ✅ já existe
│   ├── routers/                  ❌ criar (endpoints por módulo)
│   │   ├── utentes.py
│   │   ├── episodios.py
│   │   ├── triagem.py
│   │   ├── internamento.py
│   │   ├── profissionais.py
│   │   └── auth.py
│   ├── models/                   ❌ criar (modelos Pydantic)
│   ├── auth/                     ❌ criar (JWT + roles)
│   ├── db.py                     ✅ já existe
│   ├── main.py                   ✅ já existe
│   └── requirements.txt          ❌ criar
│
├── web/
│   ├── Urgencias.html            ✅ já existe
│   ├── login.html                ❌ criar
│   ├── triagem.html              ❌ criar
│   ├── dashboard.html            ❌ criar
│   └── styles.css / scripts/    ❌ criar
│
├── android/                      ❌ vazio, começar
│
├── ia/
│   └── modelo.py                 ❌ criar
│
├── docs/                         ✅ ficheiros de apoio
│
├── .env (local, não subir)        ❌ configurar
├── .gitignore                    ✅ já existe
├── README.md                     ❌ preencher
└── update_prof.sh                ✅ já existe
