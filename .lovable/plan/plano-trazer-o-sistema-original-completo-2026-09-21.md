# Plano — Trazer o sistema original completo

## Objetivo
Recriar neste projeto a mesma central escura do arquivo enviado, com suas abas, tabelas, formulários e fluxo de equipamentos, sem remover a proteção por login já implementada.

## O que será construído
- Cabeçalho e navegação no estilo original: Dashboard, Equipamentos, Perfis, Personalização ISP e GenieACS.
- Dashboard com totais de equipamentos, equipamentos online e perfis.
- Tabela completa de equipamentos com fabricante, modelo, tipo, serial, MAC, cliente, perfil, estado e ações.
- Cadastro de equipamentos e perfis, edição do JSON de parâmetros e associação de perfil ao equipamento.
- Tela de Personalização ISP com empresa, logo, suporte, mensagem, Wi‑Fi padrão, bootstrap ACS, política pós-reset e pré-visualização ao vivo.
- Área GenieACS com estado da conexão e estrutura para listar, sincronizar, atualizar e abrir os parâmetros dos dispositivos.
- Detalhes do equipamento em abas: informações, parâmetros, Wi‑Fi, WAN, TR‑069 e provisionamento manual.
- Manutenção da importação JSON e do acesso seguro aos dados de cada conta.

## Segurança e limites reais
- A API sem login do arquivo antigo não será copiada; todas as informações continuarão protegidas por conta.
- Senhas e o arquivo `.env` do ZIP não serão importados.
- Os controles GenieACS serão recriados, mas ficarão desativados e claramente identificados até existir um endereço seguro para o serviço local.
- Nenhum comando será enviado ao MR60X sem os caminhos TR‑069 reais do firmware; o arquivo enviado ainda não contém esses parâmetros.
- Os registros reais e arquivos de evidência não estão no ZIP e continuarão aguardando uma exportação JSON/CSV e os respectivos arquivos.

## Implementação
- Reorganizar a página inicial em componentes menores, preservando o visual e o conteúdo do original.
- Usar as tabelas já criadas no Lovable Cloud para clientes, equipamentos, perfis, ordens e personalização ISP.
- Implementar gravação segura para equipamentos, perfis, vínculos e configurações do provedor.
- Preparar funções protegidas para GenieACS que só serão ativadas quando a conexão externa segura estiver configurada.
- Validar em computador e celular os formulários, abas, tabelas, login e operações de cadastro/edição.

## Resultado esperado
A experiência visual e operacional do projeto enviado estará disponível aqui, com uma base mais segura. A migração dos dados reais e o provisionamento físico continuarão pendentes até recebermos a exportação e conectarmos o GenieACS.
