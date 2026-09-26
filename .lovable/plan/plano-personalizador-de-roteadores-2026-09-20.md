# Plano — Personalizador de roteadores

## Objetivo
Criar a primeira versão funcional de um programa para o instalador preparar os equipamentos antes de levá-los à casa do cliente.

## O que será construído
- Painel inicial com visão rápida dos equipamentos em preparação, prontos e pendentes.
- Fluxo guiado para cadastrar cliente e equipamento.
- Campos para modelo do roteador, identificação, nome e senha do Wi‑Fi e credenciais PPPoE.
- Revisão dos dados antes de concluir a preparação.
- Lista de instalações recentes com estados claros.
- Funcionamento local demonstrativo, sem envio real de comandos ao roteador nesta etapa.

## Aparência e uso
- Interface profissional de operação, em português, clara para uso em campo.
- Layout adaptado para computador e celular.
- Paleta clara com azul operacional, verde para equipamentos prontos e alertas em âmbar.
- Informações sensíveis ocultas por padrão.

## Detalhes técnicos
- Implementação na página inicial existente usando React e o sistema visual global.
- Dados de demonstração mantidos apenas durante a sessão da página.
- Estrutura preparada para conectar protocolos ou APIs dos fabricantes posteriormente.
- Metadados próprios para compartilhamento e identificação da página.

## Limite desta etapa
A configuração real depende dos fabricantes, modelos e métodos de acesso dos equipamentos. Esta primeira versão organiza e valida os dados, mas não altera fisicamente o roteador.
