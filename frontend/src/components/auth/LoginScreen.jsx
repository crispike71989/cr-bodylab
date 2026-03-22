export default function LoginScreen({ onLogin }) {
  onLogin({ id: "coach", role: "coach", name: "Christian", username: "christian" });
  return null;
}
