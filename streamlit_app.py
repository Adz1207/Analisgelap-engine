import streamlit as st
from google import genai

# --- 1. KONFIGURASI HALAMAN & THEME ---
st.set_page_config(
    page_title="ANALISGELAP TERMINAL V1.0", 
    page_icon="⚡", 
    layout="centered"
)

# CSS Hacking untuk vibe Terminal Cyberpunk (Ref: Analisgelap Blueprint)
st.markdown("""
    <style>
    /* Mengubah Background Utama */
    .stApp {
        background-color: #050505;
    }

    /* Styling Teks Utama (Neon Green) */
    h1, h2, h3, p, span, label, .stMarkdown {
        color: #00ff9d !important;
        font-family: 'Courier New', Courier, monospace !important;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    /* Input Field - Kotak Terminal */
    .stTextArea textarea, .stTextInput input {
        background-color: #0a0a0a !important;
        color: #00ff9d !important;
        border: 1px solid #00ff9d !important;
        border-radius: 0px !important;
        font-family: 'Courier New', monospace !important;
    }

    /* Button Neon */
    .stButton>button {
        width: 100%;
        background-color: #00ff9d !important;
        color: #050505 !important;
        font-weight: bold !important;
        border: none !important;
        border-radius: 0px !important;
        box-shadow: 0 0 10px #00ff9d;
        margin-top: 20px;
    }
    
    .stButton>button:hover {
        box-shadow: 0 0 20px #00ff9d;
        background-color: #00cc7e !important;
    }

    /* Container Hasil */
    [data-testid="stMarkdownContainer"] {
        background-color: #0a0a0a;
        padding: 15px;
        border-left: 3px solid #00ff9d;
    }
    
    /* Sidebar Styling */
    section[data-testid="stSidebar"] {
        background-color: #0d1117;
        border-right: 1px solid #00ff9d;
    }

    /* Hide Streamlit Header */
    header {visibility: hidden;}
    </style>
    """, unsafe_allow_html=True)

# --- 2. BLUEPRINT ANALISGELAP (CORE LOGIC) ---
BLUEPRINT = """
Nama lu adalah Analisgelap. Penasihat strategis yang dingin dan analitis.
Tugas lu: Ubah ide mentah menjadi narasi UGC berbahaya (Exposition, Rising Action, Climax, Falling Action, Resolution).

PROFILING LOGIC:
1. Jika user input niche, serang "Dosa Terbesar" atau kebohongan umum di niche tersebut.
2. Gunakan terminologi teknis niche tersebut.
3. Berikan 'Mathematical Loss Diagnosis' di akhir jika user menunda eksekusi.
4. Tone: Dingin, Tanpa basa-basi, Metafora Teknis.
"""

# --- 3. SIDEBAR: PARAMETERS ---
with st.sidebar:
    st.title("⚡ SYSTEM CONTROL")
    user_api_key = st.text_input("ENTER API KEY:", type="password", help="Dapatkan di aistudio.google.com")
    
# --- 4. MAIN INTERFACE ---
st.title("⚡ THE AQUARIUS CODE")
st.write(">> ANALISGELAP ENGINE READY.")

niche = st.text_input("NICHE:", placeholder="E.G. CRYPTO, MARKETING, FITNESS")
topic = st.text_area("TOPIC / RAW IDEA:", placeholder="E.G. Kenapa nunggu waktu yang tepat itu salah...")

if st.button("EXECUTE STRATEGY"):
    if not user_api_key:
        st.error("ERROR: API KEY REQUIRED.")
    elif not topic:
        st.warning("ERROR: TOPIC DATA MISSING.")
    else:
        try:
            # Menggunakan library google-genai terbaru
            client = genai.Client(api_key=user_api_key)
            
            final_prompt = f"""
            {BLUEPRINT}
            
            USER DATA:
            Niche: {niche}
            Topic: {topic}
            Style: {visual_style}
            Scenes: {scene_count}
            
            OUTPUT: Skrip UGC tajam + Visual Direction + Mathematical Loss Diagnosis.
            """
            
            with st.spinner(">> ANALYZING LOGIC DEFECTS..."):
                response = client.models.generate_content(
                    model="gemini-1.5-pro", # Atau "gemini-2.0-flash" jika sudah akses
                    contents=final_prompt
                )
                
                st.divider()
                st.markdown(response.text)
                
                # Call to Action
                st.markdown("---")
                st.info("### 🧠 SYSTEM UPGRADE")

        except Exception as e:
            st.error(f"CRITICAL ERROR: {str(e)}")

# --- 5. FOOTER ---
st.caption("V1.0 // POWERED BY ANALISGELAP // 2026")
