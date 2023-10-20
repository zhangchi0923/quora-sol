import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// import { Card, CardHeader, CardBody, CardFooter, Flex, Avatar, Box, Button, Heading, IconButton, SimpleGrid } from '@chakra-ui/react'
import { FC, useEffect, useState } from "react";
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import idl from '../../../../target/idl/quora_solana.json';


// export const BasicsView: FC = ({ }) => {

//   return (
//     <div className="md:hero mx-auto p-4">
//       <div className="md:hero-content flex flex-col">
//         <h1 className="text-center text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mt-15 mb-8">
//           My Info
//         </h1>
//         {/* CONTENT GOES HERE */}
//         <div className="text-center">

//         </div>
//       </div>
//     </div>
//   );
// };




export const InfoView: FC = ({ }) => {
  const [accounts, setAccounts] = useState([]);
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const wallet = useAnchorWallet();
  // const publicKey = wallet.publicKey;

  let provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
  const program = new Program(
    JSON.parse(JSON.stringify(idl)),
    new PublicKey(idl.metadata.address),
    provider
  );
  let account_0;
  useEffect(() => {
    const fetchAccounts = async () => {
      const accounts = await connection.getProgramAccounts(new PublicKey(idl.metadata.address), "confirmed");
      setAccounts(accounts);
    };
    fetchAccounts();
    const account_0 = await program.account.questionAccount.fetch(accounts[0].pubkey);
  }, []);

  console.log(account_0);

  const cards = [1, 2, 3, 4, 5, 6];
  // TODO remove, this demo shouldn't need to reset the theme.
  const defaultTheme = createTheme();
  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <main>
        <Container sx={{ py: 8 }} maxWidth="md">
          {/* End hero unit */}
          <Grid container spacing={4}>
            {cards.map((card) => (
              <Grid item key={card} xs={12} sm={6} md={4}>
                <Card
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      Heading
                    </Typography>
                    <Typography>
                      This is a media card. You can use this section to describe the
                      content.
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">View</Button>
                    <Button size="small">Edit</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </main>
    </ThemeProvider>
  );
}