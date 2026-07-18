const CLIENTS = [
  "Pintaboo",
  "Proease Global",
  "EngineersConnect",
  "KBR",
  "DXC Technology",
  "HowNow",
];

export default function Clients() {
  return (
    <section className="clients" id="clients">
      <div className="clients__head">
        <p className="clients__label">CUSTOMERS</p>
        <h2 className="clients__heading">Proud to be part of these brands</h2>
      </div>

      <div className="clients__grid">
        {CLIENTS.map((name) => (
          <div className="client-logo" key={name}>
            {name}
          </div>
        ))}
      </div>
    </section>
  );
}
