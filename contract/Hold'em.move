


module suiwin::suiwin {
    use sui::random::{Self, Random};
    use sui::event::emit;
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::table::{Table, Self};
    use sui::clock::{Self, Clock};
    use sui::sui::SUI;
    use std::vector;
    use std::string::{Self, String};
    use sui::dynamic_object_field as dof;

    const EInGame: u64 = 0;
    const EAdmin: u64 =1;
    const ENotPoints:u64 = 2;
    const EgiveoutprizesT:u64= 3;
    const EgiveoutprizesB:u64 = 4;

    const Adminadd: address = @0x82242fabebc3e6e331c3d5c6de3d34ff965671b75154ec1cb9e00aa437bbfa44;


    public struct GameData has key {
        id: UID,
        min:u64,
        minx2:u64,
        countdown:u16,
        serialnumber:u64,
    }
   
    public struct Fraction has store,drop {
        data: u64,
    }

    public struct Integral has key{
        id: UID,
        data: Table<address,Fraction>,
    }
    public struct IntegralTop3 has key{
        id: UID,
        balance: Balance<SUI>,
        epoch:u64,
        a1: address,
        a2: address,
        a3: address,
        v1: u64,
        v2: u64,
        v3: u64,
    }
    public struct Chips has key{
        id: UID,
        balance: Balance<SUI>,
        data: Table<address,u64>,
    }
    public struct Lock has key{
        id: UID,
        data: Table<address,bool>,
    }




    //dof::add(&mut game.id,serialnumber, gPlayer);
    

    public struct PokerData has key,store {
        id: UID,
        balance: Balance<SUI>,
        Player1:address,
        Player2:address,
        rounds:u8,
        time:u64,
        margin1:u64,
        margin2:u64,
        bet1:u64,
        bet2:u64,
    }





    
    fun init(ctx: &mut TxContext) {
        transfer::share_object(GameData {
            id: object::new(ctx),
            min:5_000_000_000,
            countdown:60_000,
            serialnumber:0,
        });
        transfer::share_object(Integral {
            id: object::new(ctx),
            data:table::new(ctx),
        });
        transfer::share_object(IntegralTop3 {
            id: object::new(ctx),
            epoch:tx_context::epoch(ctx),
            a1:Adminadd,
            a2:Adminadd,
            a3:Adminadd,
            v1:0,
            v2:0,
            v3:0,
        });
    }
   

    entry  fun start(coin_v: Coin<SUI>,game_data: &mut GameData,ctx: &mut TxContext) {
        let game = GameData8 {
            id: object::new(ctx),
            gr8:gD,
        };
        transfer::share_object(game);
           
    }
    entry  fun start8(gD: u8,ctx: &mut TxContext) {
        let game = GameData8 {
            id: object::new(ctx),
            gr8:gD,
        };
        transfer::share_object(game);
           
    }

    entry  fun start8(gD: u8,ctx: &mut TxContext) {
        let game = GameData8 {   
            id: object::new(ctx),
            gr8:gD,
        };
        transfer::share_object(game);
           
    }


    entry  fun buychips(coin_v: Coin<SUI>,chips: &mut Chips,ctx: &mut TxContext){
        let coin_value = coin::value(&coin_v);
        coin::put(&mut chips.balance, coin_v);
        if (table::contains(&chips.data, tx_context::sender(ctx))) {
            let p_ = table::borrow(&chips.data, tx_context::sender(ctx));
            let p_t = *p_ + coin_value;
 
            let mut_buy = table::borrow_mut(&mut chips.data,tx_context::sender(ctx)); 
            *mut_buy = p_t; 
        } else {
            table::add(&mut chips.data,tx_context::sender(ctx), coin_value);
        };
    }
    entry  fun sellchips(vol: u64,chips: &mut Chips,lock:&Lock,ctx: &mut TxContext){

        assert!(tx_context::sender(ctx)!=Adminadd, EAdmin);
        assert!(!table::contains(&lock.data, tx_context::sender(ctx)), EInGame);
        assert!(table::contains(&chips.data, tx_context::sender(ctx) >= vol), ENotPoints);
        assert!( vol >= 2_000_000_000, ENotPoints);
        let v_ = table::borrow(&chips.data, tx_context::sender(ctx));
        let v_t = *v_ - vol;
        if(v_t > 0){
            let mut_vol = table::borrow_mut(&mut chips.data,tx_context::sender(ctx));
            *mut_vol = v_t; 
        }else{
            table::remove(&mut chips.data,tx_context::sender(ctx)); 
        }
        let vol_a = vol/25;
        let vol_p = vol - vol_a;
        let coinvol = coin::take(&mut chips.balance, vol_p, ctx);
        transfer::public_transfer(coinvol,  tx_context::sender(ctx));
   
        if (table::contains(&chips.data, Adminadd)) {
            let p_ = table::borrow(&chips.data,Adminadd);
            let p_t = *p_ + vol_a; 
 
            let mut_a = table::borrow_mut(&mut chips.data,Adminadd); 
            *mut_a = p_t;
        } else {
            table::add(&mut chips.data,Adminadd, vol_a);
        };
    }

    entry  fun sellchipsAdmin(vol: u64,chips: &mut Chips,top3:&mut IntegralTop3,ctx: &mut TxContext){

        assert!(table::contains(&chips.data, Adminadd >= vol), ENotPoints);
        assert!( vol >= 2_000_000_000, ENotPoints);
        let v_ = table::borrow(&chips.data, Adminadd);
        let v_t = *v_ - vol;
        let mut_vol = table::borrow_mut(&mut chips.data,Adminadd); 
        *mut_vol = v_t; 
   
        let vol_P = vol/4;
        let vol_A = vol - vol_P;
        let coinvol_p = coin::take(&mut chips.balance, vol_P, ctx);
        let coinvol_a = coin::take(&mut chips.balance, vol_A, ctx);
        transfer::public_transfer(coinvol_a,  Adminadd);
        coin::put(&mut top3.balance, coinvol_p);

    }
    entry  fun giveoutprizes(top3:&mut IntegralTop3,integral:&mut Integral,ctx: &mut TxContext){

        let ep = top3.epoch - tx_context::epoch(ctx);
        let blan =  coin::value(&top3.balance)
        assert!(ep >= 90 , EgiveoutprizesT);
        assert!( blan >= 200_000_000_000, EgiveoutprizesB);
        let coin3 = blan/10;
        let coin1 = coin*6;
        let coin2 = blan - coin3-coin1;
        transfer::public_transfer(coin1,top3.a1);
        transfer::public_transfer(coin2,top3.a2);
        transfer::public_transfer(coin3,top3.a3);
        top3.a1 = Adminadd;
        top3.a2 = Adminadd;
        top3.a3 = Adminadd;
        top3.v1 = 0;
        top3.v2 = 0;
        top3.v3 = 0;
        table::drop(integral.data);
        integral.data = table::new(ctx);

    }

      


}
