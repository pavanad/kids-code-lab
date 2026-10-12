# Kids Code Lab

Nosso laboratório de código em família! Um espaço para aprender, experimentar e compartilhar jogos e homenagens feitos com HTML, CSS e JavaScript.

## Projetos

- **Homenagem aos professores:** o Desafio do Saber, uma missão com charadas, matemática e um quebra-cabeça para revelar uma mensagem especial.
- **Cacau Adventure:** uma aventura de plataforma criada por Lorena Pavan. Ajude a Cacau a encontrar seu brinquedo favorito no parque.
- **Caminho do Tigre:** projeto em desenvolvimento. A pasta está preservada, mas o jogo ainda não aparece no portal.

## Estrutura

```text
.
├── index.html                  # Portal principal da família (CSS embarcado)
├── teachers-day/
│   └── index.html              # Homenagem aos professores
├── games/
│   ├── cacau-adventure/        # Jogo da Lorena e seus recursos
│   │   ├── index.html
│   │   ├── assets/
│   │   ├── css/
│   │   └── js/
│   └── caminho-do-tigre/       # Jogo em desenvolvimento, fora do portal
└── README.md
```

Cada projeto mantém seus próprios arquivos na respectiva pasta. O portal não precisa de dependências, instalação ou etapa de build.

## GitHub Pages

Para publicar este repositório:

1. Envie os arquivos para o GitHub na branch que será usada para publicação.
2. No repositório, abra **Settings > Pages**.
3. Em **Build and deployment**, escolha **Deploy from a branch**.
4. Selecione a branch com os projetos (por exemplo, `main`) e a pasta **/ (root)**.
5. Clique em **Save** e aguarde a conclusão da publicação. A própria tela de Pages mostrará o endereço publicado.

Para o repositório `pavanad/kids-code-lab`, os endereços esperados após a publicação são:

| Página | Endereço |
| --- | --- |
| Portal da família | https://pavanad.github.io/kids-code-lab/ |
| Homenagem aos professores | https://pavanad.github.io/kids-code-lab/teachers-day/ |
| Cacau Adventure | https://pavanad.github.io/kids-code-lab/games/cacau-adventure/ |

Os links do portal são **relativos** e apontam explicitamente para os arquivos, como `teachers-day/index.html` e `games/cacau-adventure/index.html`. Assim, funcionam ao abrir o portal diretamente no computador e preservam o prefixo `/kids-code-lab/` do GitHub Pages. Evite links iniciados por `/`, pois eles apontariam para a raiz do domínio, fora do repositório.

O Caminho do Tigre não tem link no portal, mas isso não torna a pasta privada: seus arquivos também serão publicados se estiverem na branch de publicação.

## Testar localmente

Abra o `index.html` da raiz no navegador para conhecer o portal. Para testar os jogos com um servidor local, execute na raiz do repositório:

```sh
python3 -m http.server 8000
```

Depois, acesse http://localhost:8000/. Para encerrar o servidor, use `Ctrl+C` no terminal.

## Adicionar novos projetos

Crie uma pasta com um `index.html` e mantenha os recursos do projeto dentro dela. Quando estiver pronto para compartilhar, adicione um card no portal com um link relativo para essa pasta e atualize este README.
