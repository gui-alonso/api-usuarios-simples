# Projeto API de usuários

O objetivo desse projeto é ensinar os alunos a parte de criar a senha com criptografia, mostrar a importância de NUNCA cadastrar a senha do usuário em texto plano no banco de dados.

Por enquanto o projeto ainda não terá conexão direta com BD, mas em breve faremos essa atualização e vai ter o cadastro direto no BD.

## Pré-requisitos
- Node.js (versão 14+ recomendada; funciona bem com 16/18/20)
- npm (vem com Node)
- Editor de código (VS Code recomendado)

## Criando o projeto
```
mkdir api-usuario-simples
cd api-usuario-simples
npm init -y
```

## Instalar dependências
```
npm install express bcryptjs cors helmet express-validator morgan dotenv express-rate-limit uuid
npm install -D nodemon
```

## Rodar o servidor
```
node index.js
```
<aside>
💡

**ATENÇÃO**: lembre-se de verificar o nome do arquivo principal e onde ele esta no projeto.

</aside>
