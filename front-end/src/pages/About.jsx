import React from "react";

const About = () => {
  return (
    <section className="mx-auto max-w-4xl p-8">
      <div className="rounded-2xl bg-gray-200 p-6 shadow-md">
        <h1 className="text-primary-400 mb-4 text-4xl font-bold">
          Sobre o Viva Portugal
        </h1>
        <p className="mb-4">
          O <strong>Viva Portugal</strong> é uma plataforma de turismo rural que
          conecta viajantes a experiências únicas e autênticas em todo o país.
        </p>
        <p className="mb-4">
          Na nossa plataforma, pode descobrir desde vindimas tradicionais até
          passeios de bicicleta na serra, sempre com a garantia de segurança e
          uma comunidade acolhedora.
        </p>
        <p className="mb-4">
          Todo e qualquer pagamento é feito diretamente no local, atuamos como
          divulgadores das experiências e ajudamos com as reservas.
        </p>
        <p className="mb-4">
          Projetado por Hudson e Tássia, como projeto de final de curso do de
          Técnico Especialista em Tecnologia e Programação de Sistemas de
          Informação na ATEC.
        </p>
      </div>
    </section>
  );
};

export default About;
