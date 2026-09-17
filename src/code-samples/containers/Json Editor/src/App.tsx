import { Container, Stack, Typography } from "@mui/material";
import { JsonViewer } from "./components/JsonViewer/JsonViewer";

function App() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Typography variant="h5" component="h1">
          JSON Viewer
        </Typography>
        <JsonViewer />
      </Stack>
    </Container>
  );
}

export default App;
