export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const { prompt } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ erro: "O prompt não pode estar vazio." });
  }

  try {
    const respostaApi = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const dados = await respostaApi.json();

    // ---- INÍCIO DA MUDANÇA IMPORTANTE ----

    // Log para ver a resposta completa da API nos logs da Vercel
    console.log("Resposta completa da API Gemini:", JSON.stringify(dados, null, 2));

    // Verifica se a API retornou um erro explícito
    if (dados.error) {
      console.error("Erro da API Gemini:", dados.error.message);
      return res.status(500).json({ texto: `Erro da API: ${dados.error.message}` });
    }
    
    // Extrai o texto de forma segura
    const texto = dados.candidates?.[0]?.content?.parts?.[0]?.text;

    if (texto) {
      res.status(200).json({ texto });
    } else {
      // Se não houver 'candidates', pode ser por filtros de segurança, etc.
      res.status(200).json({ texto: "Não foi possível gerar uma resposta. Tente outra pergunta." });
    }
    
    // ---- FIM DA MUDANÇA IMPORTANTE ----

  } catch (erro) {
    console.error("Erro ao chamar a API:", erro);
    res.status(500).json({ erro: "Erro interno no servidor", detalhe: erro.message });
  }
}