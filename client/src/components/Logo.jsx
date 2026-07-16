import logo from "../assets/logo.png";

export default function Logo() {
  return (
    <a className="logo" href="/" aria-label="Studio Modular home">
      <img className="logo__img" src={logo} alt="Studio Modular" />
    </a>
  );
}
