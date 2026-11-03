import { Alert, Typography } from 'antd';

export function Dashboard() {
    return (
        <>
            <Typography.Title level={3}>Bem-vindo(a) ao Contato Seguro Slim!</Typography.Title>

            <Alert
                type="warning"
                showIcon
                message="Aviso sobre os dados de exemplo"
                description="Os dados cadastrados neste ambiente são meramente ilustrativos e foram gerados para fins de desenvolvimento e teste. Empresas, relatos e demais informações são fictícios. Qualquer semelhança com pessoas, empresas ou situações reais é mera coincidência."
            />
        </>
    );
}
