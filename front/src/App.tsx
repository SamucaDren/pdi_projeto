import { useState } from "react";
import "./App.css";

function App() {
  const [resultado, setResultado] = useState<string | null>(null);
  const [imagem, setImagem] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [valor, setValor] = useState<number>(50);

  const enviarImagem = async () => {
    if (!imagem) {
      alert("Selecione uma imagem");
      return;
    }

    const formData = new FormData();
    formData.append("file", imagem);
    formData.append("valor_sub", String(valor));

    const res = await fetch("http://127.0.0.1:8000/teste_de_api", {
      method: "POST",
      body: formData,
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    setResultado(url);
  };

  return (
    <section id="center">
      <input
        type="file"
        accept="image/*"
        title="a"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImagem(file);
            setPreview(URL.createObjectURL(file)); // 👈 preview original
          }
        }}
      />

      <input
        type="number"
        title="a"
        value={valor}
        onChange={(e) => setValor(Number(e.target.value))}
      />

      <button onClick={enviarImagem}>Enviar</button>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        {preview && (
          <div>
            <h3>Original</h3>
            <img src={preview} alt="original" width={300} />
          </div>
        )}

        {resultado && (
          <div>
            <h3>Resultado</h3>
            <img src={resultado} alt="resultado" width={300} />
          </div>
        )}
      </div>
    </section>
  );
}

export default App;
