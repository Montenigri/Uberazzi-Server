module.exports = (sequelize, Sequelize) => {
    const Prenotazione = sequelize.define("Prenotazione", {
      IDPrenotazione: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      IDUtente: {
        type: Sequelize.INTEGER
      },
      Partenza: {
        type: Sequelize.STRING
      },
      Arrivo: {
        type: Sequelize.STRING
      },
      DataOra: {
        type: Sequelize.DATE
      },
      IDAutista: {
        type: Sequelize.INTEGER,
        allowNull:true
      },
      Autista: {
        type: Sequelize.BOOLEAN
      },
      IDVeicolo: {
        type: Sequelize.INTEGER
      },
    });
  
    return Prenotazione;
  };