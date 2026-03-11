import React from "react";
import "../../../Styles/form.css";

export default function Iban(){

return(

<div className="page">

<h2>Informations bancaires</h2>

<div className="grid">

<div className="field">
<label>Numéro RIB</label>
<input/>
</div>

<div className="field">
<label>RIB défaut</label>
<input/>
</div>

<div className="field">
<label>Nature versement</label>
<input/>
</div>

<div className="field">
<label>Mode paiement</label>
<input/>
</div>

<div className="field">
<label>Devise</label>
<input/>
</div>

<div className="field">
<label>Date début</label>
<input type="date"/>
</div>

<div className="field">
<label>Pays IBAN</label>
<input/>
</div>

<div className="field">
<label>IBAN complet</label>
<input/>
</div>

<div className="field">
<label>BIC complet</label>
<input/>
</div>

</div>

</div>

)

}
